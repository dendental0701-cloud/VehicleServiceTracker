namespace VehicleServiceTracker.Api.DTOs
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public long UserId { get; set; }
    }
}