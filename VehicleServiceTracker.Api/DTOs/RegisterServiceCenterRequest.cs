using System.ComponentModel.DataAnnotations;

namespace VehicleServiceTracker.Api.DTOs
{
    public class RegisterServiceCenterRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Address { get; set; }
    }
}