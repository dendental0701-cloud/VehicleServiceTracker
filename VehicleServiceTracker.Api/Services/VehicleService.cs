using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Models;
using VehicleServiceTracker.Api.Repositories;

namespace VehicleServiceTracker.Api.Services
{
    public class VehicleService
    {
        private readonly VehicleRepository _vehicleRepository;

        public VehicleService(VehicleRepository vehicleRepository)
        {
            _vehicleRepository = vehicleRepository;
        }

        public async Task<long> CreateAsync(long ownerId,CreateVehicleRequest request)
        {
            var registrationNumber =request.RegistrationNumber.Trim().ToUpperInvariant();

            if (await _vehicleRepository.RegistrationExistsAsync(registrationNumber))
            {
                throw new InvalidOperationException("A vehicle with this registration number already exists.");
            }

            if (request.CurrentMileage < 0)
            {
                throw new InvalidOperationException("Current mileage cannot be negative.");
            }

            var vehicle = new Vehicle
            {
                OwnerId = ownerId,

                RegistrationNumber = registrationNumber,

                Make = request.Make.Trim(),

                Model = request.Model.Trim(),

                CurrentMileage = request.CurrentMileage
            };

            return await _vehicleRepository.CreateAsync(vehicle);
        }

        public async Task<List<VehicleResponse>> GetMyVehiclesAsync(long ownerId)
        {
            var vehicles =await _vehicleRepository.GetByOwnerIdAsync(ownerId);

            return vehicles.Select(MapToResponse).ToList();
        }

        public async Task<VehicleResponse?> GetMyVehicleAsync(long vehicleId,long ownerId)
        {
            var vehicle =await _vehicleRepository.GetByIdAndOwnerIdAsync(vehicleId,ownerId);

            if (vehicle == null)
                return null;

            return MapToResponse(vehicle);
        }

        private static VehicleResponse MapToResponse(Vehicle vehicle)
        {
            return new VehicleResponse
            {
                VehicleId = vehicle.VehicleId,

                OwnerId = vehicle.OwnerId,

                RegistrationNumber =vehicle.RegistrationNumber,

                Make = vehicle.Make,

                Model = vehicle.Model,

                CurrentMileage =vehicle.CurrentMileage,

                CreatedAt = vehicle.CreatedAt
            };
        }

        public async Task<List<OverdueVehicleResponse>>GetOverdueVehiclesAsync()
        {
            return await _vehicleRepository.GetOverdueVehiclesAsync();
        }

        public async Task<VehicleResponse?> GetByRegistrationNumberAsync(
    string registrationNumber)
        {
            var normalizedRegistrationNumber =
                registrationNumber.Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(
                normalizedRegistrationNumber))
            {
                throw new InvalidOperationException(
                    "Registration number is required.");
            }

            var vehicle =
                await _vehicleRepository
                    .GetByRegistrationNumberAsync(
                        normalizedRegistrationNumber);

            if (vehicle == null)
                return null;

            return new VehicleResponse
            {
                VehicleId = vehicle.VehicleId,

                OwnerId = vehicle.OwnerId,

                RegistrationNumber =
                    vehicle.RegistrationNumber,

                Make = vehicle.Make,

                Model = vehicle.Model,

                CurrentMileage =
                    vehicle.CurrentMileage,

                CreatedAt = vehicle.CreatedAt
            };
        }

    }
}