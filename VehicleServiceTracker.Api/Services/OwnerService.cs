using BCrypt.Net;
using VehicleServiceTracker.Api.DTOs;
using VehicleServiceTracker.Api.Models;
using VehicleServiceTracker.Api.Repositories;

namespace VehicleServiceTracker.Api.Services
{
    public class OwnerService
    {
        private readonly OwnerRepository _ownerRepository;

        public OwnerService(OwnerRepository ownerRepository)
        {
            _ownerRepository = ownerRepository;
        }

        public async Task<long> RegisterAsync(
            RegisterOwnerRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();

            if (await _ownerRepository.EmailExistsAsync(email))
            {
                throw new InvalidOperationException(
                    "An owner with this email already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password);

            var owner = new Owner
            {
                FullName = request.FullName.Trim(),
                Email = email,
                PasswordHash = passwordHash
            };

            return await _ownerRepository.CreateAsync(owner);
        }

        public async Task<Owner?> GetByEmailAsync(string email)
        {
            return await _ownerRepository.GetByEmailAsync(
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