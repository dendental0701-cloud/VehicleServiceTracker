namespace VehicleServiceTracker.Api.Models
{
    public class ServiceRecord
    {
        public long ServiceRecordId { get; set; }

        public long VehicleId { get; set; }

        public long ServiceCenterId { get; set; }

        public DateTime ServiceDate { get; set; }

        public int MileageAtService { get; set; }

        public string WorkDone { get; set; } = string.Empty;

        public DateTime NextServiceDue { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}