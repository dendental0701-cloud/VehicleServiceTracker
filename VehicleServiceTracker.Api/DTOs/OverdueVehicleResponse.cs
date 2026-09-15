namespace VehicleServiceTracker.Api.DTOs
{
    public class OverdueVehicleResponse
    {
        public long VehicleId { get; set; }

        public string RegistrationNumber { get; set; } = string.Empty;

        public string Make { get; set; } = string.Empty;

        public string Model { get; set; } = string.Empty;

        public int CurrentMileage { get; set; }

        public DateTime LastServiceDate { get; set; }

        public int LastServiceMileage { get; set; }

        public DateTime NextServiceDue { get; set; }

        public bool MileageOverdue { get; set; }

        public bool DateOverdue { get; set; }
    }
}