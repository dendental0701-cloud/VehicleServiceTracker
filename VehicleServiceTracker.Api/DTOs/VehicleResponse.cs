namespace VehicleServiceTracker.Api.DTOs
{
    public class VehicleResponse
    {
        public long VehicleId { get; set; }

        public long OwnerId { get; set; }

        public string RegistrationNumber { get; set; } = string.Empty;

        public string Make { get; set; } = string.Empty;

        public string Model { get; set; } = string.Empty;

        public int CurrentMileage { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}