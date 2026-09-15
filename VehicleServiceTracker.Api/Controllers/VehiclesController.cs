using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Services;

namespace VehicleServiceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/vehicles")]
    [Authorize(Roles = "Owner")]
    public class VehiclesController : ControllerBase
    {
        private readonly VehicleService _vehicleService;
        private readonly ServiceRecordService _serviceRecordService;

        public VehiclesController(VehicleService vehicleService, ServiceRecordService serviceRecordService)
        {
            _vehicleService = vehicleService;
            _serviceRecordService = serviceRecordService;
        }

        
        [HttpPost]
        public async Task<IActionResult> CreateVehicle(CreateVehicleRequest request)
        {
            var ownerId = GetOwnerId();

            var vehicleId =await _vehicleService.CreateAsync(ownerId,request);

            return Ok(new
            {
                success = true,
                message = "Vehicle created successfully.",
                vehicleId = vehicleId
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetMyVehicles()
        {
            var ownerId = GetOwnerId();

            var vehicles =await _vehicleService.GetMyVehiclesAsync(ownerId);

            return Ok(new
            {
                success = true,
                data = vehicles
            });
        }

        [HttpGet("{vehicleId:long}")]
        public async Task<IActionResult> GetMyVehicle(long vehicleId)
        {
            var ownerId = GetOwnerId();

            var vehicle =await _vehicleService.GetMyVehicleAsync(vehicleId,ownerId);

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

        private long GetOwnerId()
        {
            var ownerIdClaim =User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!long.TryParse(ownerIdClaim, out var ownerId))
            {
                throw new UnauthorizedAccessException("Owner identity could not be determined.");
            }

            return ownerId;
        }

        [HttpGet("{vehicleId:long}/service-history")]
        public async Task<IActionResult> GetMyVehicleServiceHistory(long vehicleId)
        {
            var ownerId = GetOwnerId();

            var vehicle =await _vehicleService.GetMyVehicleAsync(vehicleId,ownerId);

            if (vehicle == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Vehicle not found."
                });
            }

            var records =await _serviceRecordService.GetByVehicleIdAndOwnerIdAsync(vehicleId,ownerId);

            return Ok(new
            {
                success = true,
                data = records
            });
        }

    }
}