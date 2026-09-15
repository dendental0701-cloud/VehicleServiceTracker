"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { CurrentUserResponse } from "@/lib/auth";
import AuthGuard from "@/app/components/AuthGuard";
import "./dashboard.css";

interface Vehicle {
  vehicleId: number;
  ownerId: number;
  registrationNumber: string;
  make: string;
  model: string;
  currentMileage: number;
  createdAt: string;
}

interface VehiclesResponse {
  success: boolean;
  data: Vehicle[];
}

interface ServiceRecord {
  serviceRecordId: number;
  vehicleId: number;
  serviceCenterId: number;
  serviceDate: string;
  mileageAtService: number;
  workDone: string;
  nextServiceDue: string;
  createdAt: string;
}

interface ServiceHistoryResponse {
  success: boolean;
  data: ServiceRecord[];
}

interface VehicleWithService extends Vehicle {
  lastService?: ServiceRecord;
  isOverdue: boolean;
  daysOverdue: number;
  mileageOverdue: boolean;
  dateOverdue: boolean;
}

function formatDate(date?: string) {
  if (!date) {
    return "No service yet";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getDaysOverdue(date?: string) {
  if (!date) {
    return 0;
  }

  const dueDate =
    new Date(date);

  const today = new Date();

  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const difference =
    today.getTime() -
    dueDate.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

function OwnerDashboardContent() {
  const router = useRouter();

  const [user, setUser] =
    useState<CurrentUserResponse | null>(null);

  const [vehicles, setVehicles] =
    useState<VehicleWithService[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const currentUser =
          await apiRequest<CurrentUserResponse>(
            "/api/auth/me"
          );

        if (currentUser.role !== "Owner") {
          router.replace("/login");
          return;
        }

        setUser(currentUser);

        const vehicleResponse =
          await apiRequest<VehiclesResponse>(
            "/api/vehicles"
          );

        const vehicleList =
          vehicleResponse.data;

        const vehiclesWithService =
          await Promise.all(
            vehicleList.map(
              async (vehicle) => {
                try {
                  const historyResponse =
                    await apiRequest<ServiceHistoryResponse>(
                      `/api/vehicles/${vehicle.vehicleId}/service-history`
                    );

                  const history =
                    historyResponse.data;

                  const lastService =
                    history.length > 0
                      ? history[0]
                      : undefined;

                  if (!lastService) {
                    return {
                      ...vehicle,
                      lastService: undefined,
                      isOverdue: false,
                      daysOverdue: 0,
                      mileageOverdue: false,
                      dateOverdue: false,
                    };
                  }

                  const mileageOverdue =
                    vehicle.currentMileage >=
                    lastService.mileageAtService +
                      10000;

                  const dateOverdue =
                    new Date() >=
                    new Date(
                      lastService.nextServiceDue
                    );

                  const isOverdue =
                    mileageOverdue ||
                    dateOverdue;

                  const daysOverdue =
                    dateOverdue
                      ? getDaysOverdue(
                          lastService.nextServiceDue
                        )
                      : 0;

                  return {
                    ...vehicle,
                    lastService,
                    isOverdue,
                    daysOverdue,
                    mileageOverdue,
                    dateOverdue,
                  };
                } catch {
                  return {
                    ...vehicle,
                    lastService: undefined,
                    isOverdue: false,
                    daysOverdue: 0,
                    mileageOverdue: false,
                    dateOverdue: false,
                  };
                }
              }
            )
          );

        setVehicles(
          vehiclesWithService
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const overdueCount =
    vehicles.filter(
      (vehicle) =>
        vehicle.isOverdue
    ).length;

  const upToDateCount =
    vehicles.filter(
      (vehicle) =>
        !vehicle.isOverdue &&
        vehicle.lastService
    ).length;

  const noServiceCount =
    vehicles.filter(
      (vehicle) =>
        !vehicle.lastService
    ).length;

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>

          <p>
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      <header className="dashboard-header">

        <div>
          {/* <span className="dashboard-label">
            VEHICLE SERVICE & MAINTENANCE TRACKER
          </span> */}

          <h1>
            Owner Dashboard
          </h1>

          {/* <p className="welcome-text">
            Welcome back. Here's your vehicle
            maintenance overview.
          </p> */}
        </div>

      </header>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <section className="summary-grid">

        <div className="summary-card">

          <div className="summary-icon blue">
            🚘
          </div>

          <div>
            <span>
              Total Vehicles
            </span>

            <strong>
              {vehicles.length}
            </strong>
          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>
              Up to Date
            </span>

            <strong>
              {upToDateCount}
            </strong>
          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon red">
            !
          </div>

          <div>
            <span>
              Service Due
            </span>

            <strong>
              {overdueCount}
            </strong>
          </div>

        </div>

      </section>

      {/* VEHICLES */}

      <section className="dashboard-content">

        <div className="section-header">

          <div>
            <h2>
              My Vehicles
            </h2>

            <p>
              View and manage all vehicles registered
              to your account.
            </p>
          </div>

          <button
            className="add-vehicle-btn"
            onClick={() =>
              router.push(
                "/owner/vehicles/new"
              )
            }
          >
            <span>+</span>
            Add Vehicle
          </button>

        </div>

        {vehicles.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🚗
            </div>

            <h3>
              No vehicles added yet
            </h3>

            <p>
              Add your first vehicle to start
              tracking maintenance and service
              history.
            </p>

            <button
              className="add-vehicle-btn"
              onClick={() =>
                router.push(
                  "/owner/vehicles/new"
                )
              }
            >
              + Add Your First Vehicle
            </button>

          </div>

        ) : (

          <div className="vehicle-grid">

            {vehicles.map(
              (vehicle) => (

                <div
                  className={
                    vehicle.isOverdue
                      ? "vehicle-card overdue-card"
                      : "vehicle-card"
                  }
                  key={
                    vehicle.vehicleId
                  }
                >

                  <div className="vehicle-card-top">

                    <div className="vehicle-icon">
                      🚘
                    </div>

                    {vehicle.isOverdue ? (

                      <span className="vehicle-status overdue">
                        Service Due
                      </span>

                    ) : vehicle.lastService ? (

                      <span className="vehicle-status">
                        Up to Date
                      </span>

                    ) : (

                      <span className="vehicle-status new">
                        No Service
                      </span>

                    )}

                  </div>

                  <div className="vehicle-info">

                    <h3>
                      {vehicle.make}{" "}
                      {vehicle.model}
                    </h3>

                    <div className="registration">
                      {vehicle.registrationNumber}
                    </div>

                    <div className="vehicle-details">

                      <div className="detail-item">

                        <span>
                          Current Mileage
                        </span>

                        <strong>
                          {vehicle.currentMileage.toLocaleString()} km
                        </strong>

                      </div>

                      <div className="detail-item">

                        <span>
                          Last Service
                        </span>

                        <strong>
                          {formatDate(
                            vehicle.lastService
                              ?.serviceDate
                          )}
                        </strong>

                      </div>

                      <div className="detail-item">

                        <span>
                          Next Service Due
                        </span>

                        <strong
                          className={
                            vehicle.isOverdue
                              ? "due-text"
                              : ""
                          }
                        >
                          {formatDate(
                            vehicle.lastService
                              ?.nextServiceDue
                          )}
                        </strong>

                      </div>

                      <div className="detail-item">

                        <span>
                          Service Mileage
                        </span>

                        <strong>
                          {vehicle.lastService
                            ? `${vehicle.lastService.mileageAtService.toLocaleString()} km`
                            : "Not available"}
                        </strong>

                      </div>

                    </div>

                  </div>

                  {vehicle.isOverdue && (
                    <div className="maintenance-warning">

                      <span className="warning-icon">
                        !
                      </span>

                      <div>

                        <strong>
                          Service required
                        </strong>

                        <p>
                          {vehicle.dateOverdue &&
                            vehicle.daysOverdue > 0
                            ? `Service overdue by ${vehicle.daysOverdue} ${
                                vehicle.daysOverdue === 1
                                  ? "day"
                                  : "days"
                              }.`
                            : vehicle.mileageOverdue
                            ? "Mileage service interval has been reached."
                            : "Vehicle requires service."}
                        </p>

                      </div>

                    </div>
                  )}

                  {!vehicle.isOverdue &&
                    vehicle.lastService && (
                      <div className="maintenance-ok">

                        <span>
                          ✓
                        </span>

                        <p>
                          Service is currently up to date.
                        </p>

                      </div>
                    )}

                  {!vehicle.lastService && (
                    <div className="maintenance-new">

                      <span>
                        +
                      </span>

                      <p>
                        No service records yet.
                      </p>

                    </div>
                  )}

                  <div className="vehicle-card-footer">

                    <button
                      className="view-btn"
                      onClick={() =>
                        router.push(
                          `/owner/vehicles/${vehicle.vehicleId}`
                        )
                      }
                    >
                      View Vehicle
                      <span>→</span>
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

        {noServiceCount > 0 && (
          <p className="dashboard-note">
            {noServiceCount}{" "}
            {noServiceCount === 1
              ? "vehicle has"
              : "vehicles have"}{" "}
            no service history yet.
          </p>
        )}

      </section>

    </main>
  );
}

export default function OwnerDashboard() {
  return (
    <AuthGuard allowedRole="Owner">
      <OwnerDashboardContent />
    </AuthGuard>
  );
}