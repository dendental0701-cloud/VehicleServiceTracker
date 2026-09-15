using System.ComponentModel.DataAnnotations;

namespace VehicleServiceTracker.Api.DTOs
{
    public class CreateVehicleRequest
    {
        [Required]
        [MaxLength(50)]
        public string RegistrationNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Make { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Model { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int CurrentMileage { get; set; }
    }
}