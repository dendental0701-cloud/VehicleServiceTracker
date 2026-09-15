using Microsoft.AspNetCore.Mvc;
using Npgsql;
using VehicleServiceTracker.Api.Database;

namespace VehicleServiceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly DbConnectionFactory _connectionFactory;

        public HealthController(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        [HttpGet("database")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                await using var connection = _connectionFactory.CreateConnection();

                await connection.OpenAsync();

                await using var command = new NpgsqlCommand("SELECT current_database();",connection);

                var databaseName = await command.ExecuteScalarAsync();

                return Ok(new
                {
                    success = true,
                    message = "Database connection successful.",
                    database = databaseName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Database connection failed.",
                    error = ex.Message
                });
            }
        }
    }
}