using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Services;

namespace VehicleServiceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/service-records")]
    [Authorize(Roles = "ServiceCenter")]
    public class ServiceRecordsController : ControllerBase
    {
        private readonly ServiceRecordService _serviceRecordService;

        public ServiceRecordsController(ServiceRecordService serviceRecordService)
        {
            _serviceRecordService = serviceRecordService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateServiceRecord(CreateServiceRecordRequest request)
        {
            var serviceCenterId = GetServiceCenterId();

            var serviceRecordId =await _serviceRecordService.CreateAsync(serviceCenterId,request);

            return Ok(new
            {
                success = true,
                message = "Service record created successfully.",
                serviceRecordId = serviceRecordId
            });
        }

        [HttpGet("vehicle/{vehicleId:long}")]
        public async Task<IActionResult> GetVehicleServiceHistory(long vehicleId)
        {
            var records =await _serviceRecordService.GetByVehicleIdAsync(vehicleId);

            return Ok(new
            {
                success = true,
                data = records
            });
        }

        [HttpGet("{serviceRecordId:long}")]
        public async Task<IActionResult> GetServiceRecord(long serviceRecordId)
        {
            var record =await _serviceRecordService.GetByIdAsync(serviceRecordId);

            if (record == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Service record not found."
                });
            }

            return Ok(new
            {
                success = true,
                data = record
            });
        }

        private long GetServiceCenterId()
        {
            var serviceCenterIdClaim =User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!long.TryParse(serviceCenterIdClaim,out var serviceCenterId))
            {
                throw new UnauthorizedAccessException("Service center identity could not be determined.");
            }

            return serviceCenterId;
        }
    }
}