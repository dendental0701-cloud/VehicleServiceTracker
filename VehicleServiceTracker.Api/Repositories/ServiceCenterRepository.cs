using Npgsql;
using VehicleServiceTracker.Api.Database;
using VehicleServiceTracker.Api.Models;

namespace VehicleServiceTracker.Api.Repositories
{
    public class ServiceCenterRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public ServiceCenterRepository(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            await using var connection =
                _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT EXISTS
                (
                    SELECT 1
                    FROM service_centers
                    WHERE email = @email
                );
                """;

            await using var command =
                new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("email", email);

            return (bool)(await command.ExecuteScalarAsync())!;
        }

        public async Task<long> CreateAsync(ServiceCenter serviceCenter)
        {
            await using var connection =
                _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                INSERT INTO service_centers
                (
                    name,
                    email,
                    password_hash,
                    address
                )
                VALUES
                (
                    @name,
                    @email,
                    @password_hash,
                    @address
                )
                RETURNING service_center_id;
                """;

            await using var command =
                new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "name",
                serviceCenter.Name);

            command.Parameters.AddWithValue(
                "email",
                serviceCenter.Email);

            command.Parameters.AddWithValue(
                "password_hash",
                serviceCenter.PasswordHash);

            command.Parameters.AddWithValue(
                "address",
                (object?)serviceCenter.Address ?? DBNull.Value);

            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt64(result);
        }

        public async Task<ServiceCenter?> GetByEmailAsync(
            string email)
        {
            await using var connection =
                _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT
                    service_center_id,
                    name,
                    email,
                    password_hash,
                    address,
                    created_at
                FROM service_centers
                WHERE email = @email;
                """;

            await using var command =
                new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("email", email);

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new ServiceCenter
            {
                ServiceCenterId =
                    reader.GetInt64(
                        reader.GetOrdinal("service_center_id")),

                Name =
                    reader.GetString(
                        reader.GetOrdinal("name")),

                Email =
                    reader.GetString(
                        reader.GetOrdinal("email")),

                PasswordHash =
                    reader.GetString(
                        reader.GetOrdinal("password_hash")),

                Address =
                    reader.IsDBNull(
                        reader.GetOrdinal("address"))
                        ? null
                        : reader.GetString(
                            reader.GetOrdinal("address")),

                CreatedAt =
                    reader.GetDateTime(
                        reader.GetOrdinal("created_at"))
            };
        }
    }
}