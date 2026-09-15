using Npgsql;
using VehicleServiceTracker.Api.Database;
using VehicleServiceTracker.Api.Models;

namespace VehicleServiceTracker.Api.Repositories
{
    public class ServiceRecordRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public ServiceRecordRepository(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<long> CreateAsync(ServiceRecord serviceRecord)
        {
            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                INSERT INTO service_records
                (
                    vehicle_id,
                    service_center_id,
                    service_date,
                    mileage_at_service,
                    work_done,
                    next_service_due
                )
                VALUES
                (
                    @vehicle_id,
                    @service_center_id,
                    @service_date,
                    @mileage_at_service,
                    @work_done,
                    @next_service_due
                )
                RETURNING service_record_id;
                """;

            await using var command =new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("vehicle_id",serviceRecord.VehicleId);

            command.Parameters.AddWithValue("service_center_id",serviceRecord.ServiceCenterId);

            command.Parameters.AddWithValue("service_date",serviceRecord.ServiceDate.Date);

            command.Parameters.AddWithValue("mileage_at_service",serviceRecord.MileageAtService);

            command.Parameters.AddWithValue("work_done",serviceRecord.WorkDone);

            command.Parameters.AddWithValue("next_service_due",serviceRecord.NextServiceDue.Date);

            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt64(result);
        }

        public async Task<List<ServiceRecord>> GetByVehicleIdAsync(long vehicleId)
        {
            var records = new List<ServiceRecord>();

            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT
                    service_record_id,
                    vehicle_id,
                    service_center_id,
                    service_date,
                    mileage_at_service,
                    work_done,
                    next_service_due,
                    created_at
                FROM service_records
                WHERE vehicle_id = @vehicle_id
                ORDER BY service_date DESC, service_record_id DESC;
                """;

            await using var command =new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("vehicle_id",vehicleId);

            await using var reader =await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                records.Add(MapServiceRecord(reader));
            }

            return records;
        }

        public async Task<ServiceRecord?> GetByIdAsync(long serviceRecordId)
        {
            await using var connection =
                _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT
                    service_record_id,
                    vehicle_id,
                    service_center_id,
                    service_date,
                    mileage_at_service,
                    work_done,
                    next_service_due,
                    created_at
                FROM service_records
                WHERE service_record_id = @service_record_id;
                """;

            await using var command =
                new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "service_record_id",
                serviceRecordId);

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return MapServiceRecord(reader);
        }

        private static ServiceRecord MapServiceRecord(NpgsqlDataReader reader)
        {
            return new ServiceRecord
            {
                ServiceRecordId = reader.GetInt64(
                    reader.GetOrdinal("service_record_id")),

                VehicleId = reader.GetInt64(
                    reader.GetOrdinal("vehicle_id")),

                ServiceCenterId = reader.GetInt64(
                    reader.GetOrdinal("service_center_id")),

                ServiceDate = reader.GetDateTime(
                    reader.GetOrdinal("service_date")),

                MileageAtService = reader.GetInt32(
                    reader.GetOrdinal("mileage_at_service")),

                WorkDone = reader.GetString(
                    reader.GetOrdinal("work_done")),

                NextServiceDue = reader.GetDateTime(
                    reader.GetOrdinal("next_service_due")),

                CreatedAt = reader.GetDateTime(
                    reader.GetOrdinal("created_at"))
            };
        }


        public async Task<List<ServiceRecord>> GetByVehicleIdAndOwnerIdAsync(long vehicleId,long ownerId)
        {
            var records = new List<ServiceRecord>();

            await using var connection =_connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
        SELECT
            sr.service_record_id,
            sr.vehicle_id,
            sr.service_center_id,
            sr.service_date,
            sr.mileage_at_service,
            sr.work_done,
            sr.next_service_due,
            sr.created_at
        FROM service_records sr
        INNER JOIN vehicles v
            ON sr.vehicle_id = v.vehicle_id
        WHERE sr.vehicle_id = @vehicle_id
          AND v.owner_id = @owner_id
        ORDER BY sr.service_date DESC,
                 sr.service_record_id DESC;
        """;

            await using var command =
                new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "vehicle_id",
                vehicleId);

            command.Parameters.AddWithValue(
                "owner_id",
                ownerId);

            await using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                records.Add(MapServiceRecord(reader));
            }

            return records;
        }
    }
}