using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using VehicleServiceTracker.Api.Authentication;
using VehicleServiceTracker.Api.Database;
using VehicleServiceTracker.Api.Middleware;
using VehicleServiceTracker.Api.Repositories;
using VehicleServiceTracker.Api.Services;

var builder = WebApplication.CreateBuilder(args);


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// CONTROLLERS

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description =
                "Enter JWT token. Example: Bearer {your token}"
        });

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference =new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type =Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,

                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});


// DATABASE
builder.Services.AddSingleton<DbConnectionFactory>();


// REPOSITORIES
builder.Services.AddScoped<OwnerRepository>();
builder.Services.AddScoped<ServiceCenterRepository>();
builder.Services.AddScoped<VehicleRepository>();
builder.Services.AddScoped<ServiceRecordRepository>();


// SERVICES

builder.Services.AddScoped<OwnerService>();
builder.Services.AddScoped<ServiceCenterService>();
builder.Services.AddScoped<VehicleService>();
builder.Services.AddScoped<ServiceRecordService>();


// JWT SERVICE

builder.Services.AddSingleton<JwtService>();


// JWT CONFIGURATION

var jwtKey =builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT key is not configured.");

var jwtIssuer =builder.Configuration["Jwt:Issuer"];

var jwtAudience =builder.Configuration["Jwt:Audience"];


// AUTHENTICATION
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),

                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };

        // Read JWT from HttpOnly cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token =context.Request.Cookies["access_token"];

                if (!string.IsNullOrWhiteSpace(token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            }
        };
    });


// AUTHORIZATION

builder.Services.AddAuthorization();


// BUILD APP
var app = builder.Build();

// GLOBAL EXCEPTION HANDLING
app.UseMiddleware<ExceptionMiddleware>();


// CORS
app.UseCors("Frontend");


// SWAGGER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS
app.UseHttpsRedirection();


// AUTHENTICATION / AUTHORIZATION

app.UseAuthentication();
app.UseAuthorization();


// CONTROLLERS
app.MapControllers();

app.Run();