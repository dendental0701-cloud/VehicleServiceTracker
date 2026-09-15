using Npgsql;
using VehicleServiceTracker.Api.Database;
using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Models;

namespace VehicleServiceTracker.Api.Repositories
{
    public class VehicleRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public VehicleRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<long> CreateAsync(Vehicle vehicle)
        {
            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                INSERT INTO vehicles
                (
                    owner_id,registration_number,make,model,current_mileage
                )
                VALUES
                (
                    @owner_id,@registration_number,@make,@model,@current_mileage
                )
                RETURNING vehicle_id;
                """;

            await using var command = new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("owner_id",vehicle.OwnerId);

            command.Parameters.AddWithValue("registration_number",vehicle.RegistrationNumber);

            command.Parameters.AddWithValue("make",vehicle.Make);

            command.Parameters.AddWithValue("model",vehicle.Model);

            command.Parameters.AddWithValue("current_mileage",vehicle.CurrentMileage);

            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt64(result);
        }

        public async Task<bool> RegistrationExistsAsync(string registrationNumber)
        {
            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT EXISTS
                (
                    SELECT 1
                    FROM vehicles
                    WHERE registration_number = @registration_number
                );
                """;

            await using var command =new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("registration_number",registrationNumber);

            return (bool)(await command.ExecuteScalarAsync())!;
        }

        public async Task<List<Vehicle>> GetByOwnerIdAsync(long ownerId)
        {
            var vehicles = new List<Vehicle>();

            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT
                    vehicle_id,owner_id,registration_number,make,model,current_mileage,
                    created_at
                FROM vehicles
                WHERE owner_id = @owner_id
                ORDER BY created_at DESC;
                """;

            await using var command =new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("owner_id",ownerId);

            await using var reader =await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                vehicles.Add(new Vehicle
                {
                    VehicleId = reader.GetInt64(reader.GetOrdinal("vehicle_id")),

                    OwnerId = reader.GetInt64(reader.GetOrdinal("owner_id")),

                    RegistrationNumber = reader.GetString(reader.GetOrdinal("registration_number")),

                    Make = reader.GetString(reader.GetOrdinal("make")),

                    Model = reader.GetString(reader.GetOrdinal("model")),

                    CurrentMileage = reader.GetInt32(reader.GetOrdinal("current_mileage")),

                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at"))
                });
            }

            return vehicles;
        }

        public async Task<Vehicle?> GetByIdAndOwnerIdAsync(long vehicleId,long ownerId)
        {
            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT
                    vehicle_id,
                    owner_id,
                    registration_number,
                    make,
                    model,
                    current_mileage,
                    created_at
                FROM vehicles
                WHERE vehicle_id = @vehicle_id
                  AND owner_id = @owner_id;
                """;

            await using var command =new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("vehicle_id",vehicleId);

            command.Parameters.AddWithValue("owner_id",ownerId);

            await using var reader =await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new Vehicle
            {
                VehicleId = reader.GetInt64(reader.GetOrdinal("vehicle_id")),

                OwnerId = reader.GetInt64(reader.GetOrdinal("owner_id")),

                RegistrationNumber = reader.GetString(reader.GetOrdinal("registration_number")),

                Make = reader.GetString(reader.GetOrdinal("make")),

                Model = reader.GetString(reader.GetOrdinal("model")),

                CurrentMileage = reader.GetInt32(reader.GetOrdinal("current_mileage")),

                CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at"))
            };
        }


        public async Task<Vehicle?> GetByIdAsync(long vehicleId)
        {
            await using var connection =
                _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
        SELECT
            vehicle_id,
            owner_id,
            registration_number,
            make,
            model,
            current_mileage,
            created_at
        FROM vehicles
        WHERE vehicle_id = @vehicle_id;
        """;

            await using var command =
                new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "vehicle_id",
                vehicleId);

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new Vehicle
            {
                VehicleId = reader.GetInt64(
                    reader.GetOrdinal("vehicle_id")),

                OwnerId = reader.GetInt64(
                    reader.GetOrdinal("owner_id")),

                RegistrationNumber = reader.GetString(
                    reader.GetOrdinal("registration_number")),

                Make = reader.GetString(
                    reader.GetOrdinal("make")),

                Model = reader.GetString(
                    reader.GetOrdinal("model")),

                CurrentMileage = reader.GetInt32(
                    reader.GetOrdinal("current_mileage")),

                CreatedAt = reader.GetDateTime(
                    reader.GetOrdinal("created_at"))
            };
        }


        public async Task<List<OverdueVehicleResponse>>GetOverdueVehiclesAsync()
        {
            var vehicles = new List<OverdueVehicleResponse>();

            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
        WITH latest_service AS
        (
            SELECT
                sr.vehicle_id,
                sr.service_date,
                sr.mileage_at_service,
                sr.next_service_due,

                ROW_NUMBER() OVER
                (
                    PARTITION BY sr.vehicle_id
                    ORDER BY
                        sr.service_date DESC,
                        sr.service_record_id DESC
                ) AS row_number
            FROM service_records sr
        )
        SELECT
            v.vehicle_id,
            v.registration_number,
            v.make,
            v.model,
            v.current_mileage,

            ls.service_date AS last_service_date,
            ls.mileage_at_service AS last_service_mileage,
            ls.next_service_due,

            (
                v.current_mileage >=
                ls.mileage_at_service + 10000
            ) AS mileage_overdue,

            (
                CURRENT_DATE >= ls.next_service_due
            ) AS date_overdue

        FROM vehicles v

        INNER JOIN latest_service ls
            ON v.vehicle_id = ls.vehicle_id
            AND ls.row_number = 1

        WHERE
            v.current_mileage >=
                ls.mileage_at_service + 10000

            OR

            CURRENT_DATE >= ls.next_service_due

        ORDER BY
            ls.next_service_due ASC;
        """;

            await using var command =new NpgsqlCommand(sql, connection);

            await using var reader =await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                vehicles.Add(new OverdueVehicleResponse
                {
                    VehicleId = reader.GetInt64(reader.GetOrdinal("vehicle_id")),

                    RegistrationNumber = reader.GetString(reader.GetOrdinal("registration_number")),

                    Make = reader.GetString(reader.GetOrdinal("make")),

                    Model = reader.GetString(reader.GetOrdinal("model")),

                    CurrentMileage = reader.GetInt32(reader.GetOrdinal("current_mileage")),

                    LastServiceDate = reader.GetDateTime(reader.GetOrdinal("last_service_date")),

                    LastServiceMileage = reader.GetInt32(reader.GetOrdinal("last_service_mileage")),

                    NextServiceDue = reader.GetDateTime(reader.GetOrdinal("next_service_due")),

                    MileageOverdue = reader.GetBoolean(reader.GetOrdinal("mileage_overdue")),

                    DateOverdue = reader.GetBoolean(reader.GetOrdinal("date_overdue"))
                });
            }

            return vehicles;
        }

        public async Task<Vehicle?> GetByRegistrationNumberAsync(string registrationNumber)
        {
            await using var connection =
                _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
        SELECT
            vehicle_id,
            owner_id,
            registration_number,
            make,
            model,
            current_mileage,
            created_at
        FROM vehicles
        WHERE registration_number = @registration_number;
        """;

            await using var command =
                new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "registration_number",
                registrationNumber);

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new Vehicle
            {
                VehicleId = reader.GetInt64(
                    reader.GetOrdinal("vehicle_id")),

                OwnerId = reader.GetInt64(
                    reader.GetOrdinal("owner_id")),

                RegistrationNumber = reader.GetString(
                    reader.GetOrdinal("registration_number")),

                Make = reader.GetString(
                    reader.GetOrdinal("make")),

                Model = reader.GetString(
                    reader.GetOrdinal("model")),

                CurrentMileage = reader.GetInt32(
                    reader.GetOrdinal("current_mileage")),

                CreatedAt = reader.GetDateTime(
                    reader.GetOrdinal("created_at"))
            };
        }

    }
}