using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Models;
using VehicleServiceTracker.Api.Repositories;

namespace VehicleServiceTracker.Api.Services
{
    public class ServiceCenterService
    {
        private readonly ServiceCenterRepository
            _serviceCenterRepository;

        public ServiceCenterService(
            ServiceCenterRepository serviceCenterRepository)
        {
            _serviceCenterRepository = serviceCenterRepository;
        }

        public async Task<long> RegisterAsync(
            RegisterServiceCenterRequest request)
        {
            var email =
                request.Email.Trim().ToLowerInvariant();

            if (await _serviceCenterRepository
                .EmailExistsAsync(email))
            {
                throw new InvalidOperationException(
                    "A service center with this email already exists.");
            }

            var passwordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password);

            var serviceCenter = new ServiceCenter
            {
                Name = request.Name.Trim(),

                Email = email,

                PasswordHash = passwordHash,

                Address = string.IsNullOrWhiteSpace(request.Address)
                    ? null
                    : request.Address.Trim()
            };

            return await _serviceCenterRepository
                .CreateAsync(serviceCenter);
        }

        public async Task<ServiceCenter?> GetByEmailAsync(
            string email)
        {
            return await _serviceCenterRepository
                .GetByEmailAsync(
                    email.Trim().ToLowerInvariant());
        }

        public bool VerifyPassword(
            string password,
            string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(
                password,
                passwordHash);
        }
    }
}