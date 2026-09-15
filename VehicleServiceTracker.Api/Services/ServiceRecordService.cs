using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Models;
using VehicleServiceTracker.Api.Repositories;

namespace VehicleServiceTracker.Api.Services
{
    public class ServiceRecordService
    {
        private readonly ServiceRecordRepository _serviceRecordRepository;
        private readonly VehicleRepository _vehicleRepository;

        public ServiceRecordService(
            ServiceRecordRepository serviceRecordRepository,
            VehicleRepository vehicleRepository)
        {
            _serviceRecordRepository = serviceRecordRepository;
            _vehicleRepository = vehicleRepository;
        }

        public async Task<long> CreateAsync(
            long serviceCenterId,
            CreateServiceRecordRequest request)
        {
            if (request.VehicleId <= 0)
            {
                throw new InvalidOperationException(
                    "A valid vehicle is required.");
            }

            if (request.ServiceDate.Date > DateTime.UtcNow.Date)
            {
                throw new InvalidOperationException(
                    "Service date cannot be in the future.");
            }

            if (request.MileageAtService < 0)
            {
                throw new InvalidOperationException(
                    "Mileage at service cannot be negative.");
            }

            if (string.IsNullOrWhiteSpace(request.WorkDone))
            {
                throw new InvalidOperationException(
                    "Work done is required.");
            }

            var vehicle =
                await _vehicleRepository.GetByIdAsync(
                    request.VehicleId);

            if (vehicle == null)
            {
                throw new InvalidOperationException(
                    "Vehicle not found.");
            }

            /*
             * Business rule:
             * Next service is due 6 months after the service date.
             *
             * The 10,000 km rule will be evaluated separately
             * when we build the overdue-vehicle query.
             */
            var nextServiceDue =
                request.ServiceDate.Date.AddMonths(6);

            var serviceRecord = new ServiceRecord
            {
                VehicleId = request.VehicleId,

                ServiceCenterId = serviceCenterId,

                ServiceDate = request.ServiceDate.Date,

                MileageAtService = request.MileageAtService,

                WorkDone = request.WorkDone.Trim(),

                NextServiceDue = nextServiceDue
            };

            return await _serviceRecordRepository.CreateAsync(
                serviceRecord);
        }

        public async Task<List<ServiceRecordResponse>>
            GetByVehicleIdAsync(long vehicleId)
        {
            var records =
                await _serviceRecordRepository
                    .GetByVehicleIdAsync(vehicleId);

            return records
                .Select(MapToResponse)
                .ToList();
        }

        public async Task<ServiceRecordResponse?>
            GetByIdAsync(long serviceRecordId)
        {
            var record =
                await _serviceRecordRepository
                    .GetByIdAsync(serviceRecordId);

            if (record == null)
                return null;

            return MapToResponse(record);
        }

        private static ServiceRecordResponse MapToResponse(ServiceRecord record)
        {
            return new ServiceRecordResponse
            {
                ServiceRecordId = record.ServiceRecordId,

                VehicleId = record.VehicleId,

                ServiceCenterId = record.ServiceCenterId,

                ServiceDate = record.ServiceDate,

                MileageAtService = record.MileageAtService,

                WorkDone = record.WorkDone,

                NextServiceDue = record.NextServiceDue,

                CreatedAt = record.CreatedAt
            };
        }


        public async Task<List<ServiceRecordResponse>>GetByVehicleIdAndOwnerIdAsync(long vehicleId,long ownerId)
        {
            var records =await _serviceRecordRepository.GetByVehicleIdAndOwnerIdAsync(vehicleId,ownerId);

            return records.Select(MapToResponse).ToList();
        }




    }
}