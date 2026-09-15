using Npgsql;
using VehicleServiceTracker.Api.Database;
using VehicleServiceTracker.Api.Models;

namespace VehicleServiceTracker.Api.Repositories
{
    public class OwnerRepository
    {
        private readonly DbConnectionFactory _connectionFactory;

        public OwnerRepository(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            await using var connection = _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT EXISTS
                (
                    SELECT 1
                    FROM owners
                    WHERE email = @email
                );
                """;

            await using var command = new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("email", email);

            return (bool)(await command.ExecuteScalarAsync())!;
        }

        public async Task<long> CreateAsync(Owner owner)
        {
            await using var connection = _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                INSERT INTO owners
                (
                    full_name,
                    email,
                    password_hash
                )
                VALUES
                (
                    @full_name,
                    @email,
                    @password_hash
                )
                RETURNING owner_id;
                """;

            await using var command = new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "full_name",
                owner.FullName);

            command.Parameters.AddWithValue(
                "email",
                owner.Email);

            command.Parameters.AddWithValue(
                "password_hash",
                owner.PasswordHash);

            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt64(result);
        }

        public async Task<Owner?> GetByEmailAsync(string email)
        {
            await using var connection = _connectionFactory.CreateConnection();

            await connection.OpenAsync();

            const string sql = """
                SELECT
                    owner_id,
                    full_name,
                    email,
                    password_hash,
                    created_at
                FROM owners
                WHERE email = @email;
                """;

            await using var command = new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("email", email);

            await using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new Owner
            {
                OwnerId = reader.GetInt64(
                    reader.GetOrdinal("owner_id")),

                FullName = reader.GetString(
                    reader.GetOrdinal("full_name")),

                Email = reader.GetString(
                    reader.GetOrdinal("email")),

                PasswordHash = reader.GetString(
                    reader.GetOrdinal("password_hash")),

                CreatedAt = reader.GetDateTime(
                    reader.GetOrdinal("created_at"))
            };
        }
    }
}