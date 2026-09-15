using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VehicleServiceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestAuthorizationController : ControllerBase
    {
        [Authorize]
        [HttpGet("authenticated")]
        public IActionResult Authenticated()
        {
            return Ok(new
            {
                message = "You are authenticated.",
                userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value,

                role = User.FindFirst(System.Security.Claims.ClaimTypes.Role
                )?.Value
            });
        }

        [Authorize(Roles = "Owner")]
        [HttpGet("owner-only")]
        public IActionResult OwnerOnly()
        {
            return Ok(new
            {
                message = "You have Owner access."
            });
        }

        [Authorize(Roles = "ServiceCenter")]
        [HttpGet("service-center-only")]
        public IActionResult ServiceCenterOnly()
        {
            return Ok(new
            {
                message = "You have Service Center access."
            });
        }
    }
}