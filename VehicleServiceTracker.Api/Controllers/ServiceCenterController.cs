using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleServiceTracker.Api.Services;

namespace VehicleServiceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/service-centers")]
    [Authorize(Roles = "ServiceCenter")]
    public class ServiceCenterController : ControllerBase
    {
        private readonly VehicleService _vehicleService;

        public ServiceCenterController(VehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        [HttpGet("overdue-vehicles")]
        public async Task<IActionResult> GetOverdueVehicles()
        {
            var vehicles =await _vehicleService.GetOverdueVehiclesAsync();

            return Ok(new
            {
                success = true,
                data = vehicles
            });
        }

        [HttpGet("vehicles/search")]
        public async Task<IActionResult> SearchVehicle([FromQuery] string registrationNumber)
        {
            var vehicle =
                await _vehicleService
                    .GetByRegistrationNumberAsync(
                        registrationNumber);

            if (vehicle == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Vehicle not found."
                });
            }

            return Ok(new
            {
                success = true,
                data = vehicle
            });
        }
    }
}