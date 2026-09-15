namespace VehicleServiceTracker.Api.Models
{
    public class ServiceCenter
    {
        public long ServiceCenterId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}