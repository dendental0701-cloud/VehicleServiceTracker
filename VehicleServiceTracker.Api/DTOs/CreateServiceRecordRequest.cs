using System.ComponentModel.DataAnnotations;

namespace VehicleServiceTracker.Api.DTOs
{
    public class CreateServiceRecordRequest
    {
        [Required]
        public long VehicleId { get; set; }

        [Required]
        public DateTime ServiceDate { get; set; }

        [Range(0, int.MaxValue)]
        public int MileageAtService { get; set; }

        [Required]
        [MaxLength(5000)]
        public string WorkDone { get; set; } = string.Empty;
    }
}