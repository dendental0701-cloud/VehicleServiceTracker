using Microsoft.AspNetCore.Mvc;
using VehicleServiceTracker.Api.Authentication;
using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;



namespace VehicleServiceTracker.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly OwnerService _ownerService;
        private readonly ServiceCenterService _serviceCenterService;
        private readonly JwtService _jwtService;

        public AuthController(OwnerService ownerService,ServiceCenterService serviceCenterService,
            JwtService jwtService)
        {
            _ownerService = ownerService;
            _serviceCenterService = serviceCenterService;
            _jwtService = jwtService;
        }

        
        [HttpPost("owner/register")]
        public async Task<IActionResult> RegisterOwner(RegisterOwnerRequest request)
        {
            var ownerId = await _ownerService.RegisterAsync(request);

            return Ok(new
            {
                success = true,
                message = "Owner registered successfully.",
                userId = ownerId
            });
        }

        
        [HttpPost("owner/login")]
        public async Task<IActionResult> LoginOwner(LoginRequest request)
        {
            var owner =await _ownerService.GetByEmailAsync(request.Email);

            if (owner == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid email or password."
                });
            }

            var validPassword =_ownerService.VerifyPassword(request.Password,owner.PasswordHash);

            if (!validPassword)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid email or password."
                });
            }

            var token =_jwtService.GenerateToken(owner.OwnerId,"Owner");

            Response.Cookies.Append("access_token",token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(60),
                    Path = "/"
                });

            return Ok(new
            {
                success = true,
                role = "Owner",
                userId = owner.OwnerId
            });
        }


        [HttpPost("service-center/register")]
        public async Task<IActionResult> RegisterServiceCenter(RegisterServiceCenterRequest request)
        {
            var serviceCenterId =await _serviceCenterService.RegisterAsync(request);

            return Ok(new
            {
                success = true,
                message = "Service center registered successfully.",
                userId = serviceCenterId
            });
        }


        [HttpPost("service-center/login")]
        
        public async Task<IActionResult> LoginServiceCenter(LoginRequest request)
        {
            var serviceCenter =await _serviceCenterService.GetByEmailAsync(request.Email);

            if (serviceCenter == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid email or password."
                });
            }

            var validPassword =_serviceCenterService.VerifyPassword(request.Password,serviceCenter.PasswordHash);

            if (!validPassword)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid email or password."
                });
            }

            var token =_jwtService.GenerateToken(serviceCenter.ServiceCenterId,"ServiceCenter");

            Response.Cookies.Append("access_token",token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(60),
                    Path = "/"
                });

            return Ok(new
            {
                success = true,
                role = "ServiceCenter",
                userId = serviceCenter.ServiceCenterId
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("access_token",
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/"
                });

            return Ok(new
            {
                success = true,
                message = "Logged out successfully."
            });
        }


        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userIdClaim =User.FindFirstValue(ClaimTypes.NameIdentifier);

            var roleClaim =User.FindFirstValue(ClaimTypes.Role);

            if (!long.TryParse(userIdClaim,out var userId))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "User identity could not be determined."
                });
            }

            if (string.IsNullOrWhiteSpace(roleClaim))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "User role could not be determined."
                });
            }

            return Ok(new
            {
                success = true,
                userId = userId,
                role = roleClaim
            });
        }
    }
}