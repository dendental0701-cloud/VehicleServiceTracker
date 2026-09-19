# Vehicle Service & Maintenance Tracker

A full-stack vehicle maintenance tracking application built with Next.js, ASP.NET Core Web API, and PostgreSQL.

The application helps vehicle owners manage their vehicles and service history, while service centers can search vehicles and record completed maintenance.

## Live Application

- Frontend: https://vehicle-service-tracker-gamma.vercel.app/
- Backend API: https://vehicleservicetracker-production.up.railway.app
- Database Health Check: https://vehicleservicetracker-production.up.railway.app/api/health/database
- GitHub: https://github.com/dendental0701-cloud/VehicleServiceTracker

## Project Scope

The current application has two roles:

### Owner
- Register and log in
- Add and manage owned vehicles
- View vehicle service history
- View next service due date
- See overdue maintenance warnings

### Service Center
- Register and log in
- Search for a vehicle by registration number
- View vehicle information
- Record service performed on a vehicle

> Admin role is not part of the current project scope.

## Overdue-Service Business Rule

A vehicle is considered overdue when **either** of these conditions is met:

1. **Date rule:** the current date is on or after `next_service_due`.
2. **Mileage rule:** the current mileage has reached at least **10,000 km more than the mileage recorded at the latest service**.

A service record sets:

```text
next_service_due = service_date + 6 months
```

The application therefore uses an **OR condition** between the 6-month date interval and the 10,000 km mileage interval.

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- App Router
- CSS

### Backend
- ASP.NET Core Web API
- .NET 8
- JWT authentication
- Role-based authorization
- Npgsql
- Raw SQL

### Database
- PostgreSQL

### Deployment
- GitHub — source control
- Vercel — Next.js frontend
- Railway — ASP.NET Core API
- Railway PostgreSQL — production database
- Docker — backend containerization

## Architecture

```text
Browser
   |
   v
Next.js / React
   |
   | HTTPS API requests
   v
ASP.NET Core Web API
   |
   +--> Authentication / Authorization
   |
   +--> Controllers
   |
   +--> Service Layer
   |
   +--> Repository Layer
   |
   +--> Npgsql + Raw SQL
             |
             v
        PostgreSQL
```

The application follows a layered backend architecture:

```text
Controller
    ->
Service
    ->
Repository
    ->
Npgsql / SQL
    ->
PostgreSQL
```

## Authentication & Security

Authentication is JWT-based.

After a successful login:

1. The backend verifies the supplied password.
2. Passwords are stored using **BCrypt hashing**, not plain text.
3. The backend creates a JWT containing the user ID and role.
4. The JWT is stored in an **HttpOnly, Secure cookie** named `access_token`.
5. Protected API requests use the authenticated identity from the JWT claims.

The backend validates:
- JWT signature
- issuer
- audience
- token lifetime
- user role

Frontend route protection is also used, but backend authorization is the actual security boundary.

## Owner Data Isolation

The backend derives the authenticated Owner ID from the JWT claims rather than trusting an Owner ID supplied by the client.

Vehicle and service-history queries use the authenticated Owner ID, ensuring that an Owner can access only their own vehicle data.

## Database Design

The main tables are:

```text
owners
service_centers
vehicles
service_records
```

Relationships:

```text
Owner
  |
  +----< Vehicles
             |
             +----< Service Records >---- Service Center
```

Important constraints include primary keys, foreign keys, unique registration numbers/emails, and mileage validation.

Indexes are used for common lookups such as owner-based vehicle queries, service history, and overdue-service checks.

## Main Application Flow

### Owner flow

```text
Owner Login
   ->
JWT in HttpOnly Cookie
   ->
Owner Dashboard
   ->
Load Own Vehicles
   ->
View Service History
   ->
Check Next Service Due
   ->
Show Overdue Warning when date OR mileage threshold is reached
```

### Service Center flow

```text
Service Center Login
   ->
JWT in HttpOnly Cookie
   ->
Vehicle Search by Registration Number
   ->
Select Vehicle
   ->
Enter Service Details
   ->
Create Service Record
   ->
PostgreSQL
```

## Production Deployment

The frontend is deployed on Vercel.

The backend is deployed on Railway using a Dockerfile based on .NET 8.

The PostgreSQL database runs as a separate Railway service.

The backend receives production configuration through Railway environment variables, including:

```text
ConnectionStrings__DefaultConnection
Jwt__Key
Jwt__Issuer
Jwt__Audience
Jwt__ExpiryMinutes
```

The backend database connection uses Railway's service-variable reference to the PostgreSQL service's `DATABASE_URL`.

## Local Development

### Backend

Prerequisites:
- .NET 8 SDK
- PostgreSQL
- Visual Studio 2022 or another .NET development environment

Configure the development database connection and JWT settings in the local development configuration.

Run the API from the `VehicleServiceTracker.Api` project.

### Frontend

Prerequisites:
- Node.js
- npm

Configure:

```text
NEXT_PUBLIC_API_URL=<backend-api-url>
```

Then install dependencies and start the Next.js development server.

## Repository Structure

```text
VehicleServiceTracker
|
+-- Frontend
|   +-- vehicle-service-tracker
|
+-- VehicleServiceTracker.Api
|   +-- Authentication
|   +-- Controllers
|   +-- Database
|   +-- DTOs
|   +-- Middleware
|   +-- Models
|   +-- Repositories
|   +-- Services
|   +-- Dockerfile
|
+-- VehicleServiceTracker.Api.sln
+-- .gitignore
+-- README.md
```

## Key Implementation Points

- JWT authentication with Owner and Service Center roles
- HttpOnly authentication cookie
- BCrypt password hashing
- Backend role-based authorization
- Owner-level data isolation using JWT claims
- Npgsql with raw SQL instead of an ORM
- PostgreSQL relational schema with foreign keys and indexes
- Automatic `next_service_due` calculation at service creation
- Overdue detection based on both time and mileage thresholds
- Dockerized .NET 8 backend
- GitHub-based source control
- Vercel + Railway production deployment

## Project Status

The current deployed scope is complete for the Owner and Service Center workflows described above.

The current release does not include an Admin role, appointment scheduling, notifications, or mileage-based service prediction beyond the implemented 10,000 km overdue threshold.
