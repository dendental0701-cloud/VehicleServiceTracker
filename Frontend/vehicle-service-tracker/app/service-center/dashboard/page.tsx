"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { CurrentUserResponse } from "@/lib/auth";
import AuthGuard from "@/app/components/AuthGuard";
import "./dashboard.css";

interface OverdueVehicle {
  vehicleId: number;
  registrationNumber: string;
  make: string;
  model: string;
  currentMileage: number;
  lastServiceDate: string;
  lastServiceMileage: number;
  nextServiceDue: string;
  mileageOverdue: boolean;
  dateOverdue: boolean;
}

interface OverdueVehiclesResponse {
  success: boolean;
  data: OverdueVehicle[];
}

function ServiceCenterDashboardContent() {
  const router = useRouter();

  const [user, setUser] =
    useState<CurrentUserResponse | null>(null);

  const [overdueVehicles, setOverdueVehicles] =
    useState<OverdueVehicle[]>([]);

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

        if (
          currentUser.role !==
          "ServiceCenter"
        ) {
          router.replace("/login");
          return;
        }

        setUser(currentUser);

        const overdueResponse =
          await apiRequest<OverdueVehiclesResponse>(
            "/api/service-centers/overdue-vehicles"
          );

        setOverdueVehicles(
          overdueResponse.data
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

  if (loading) {
    return (
      <main className="service-dashboard-page">
        <div className="service-loading">
          <div className="service-spinner"></div>

          <p>
            Loading service center dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="service-dashboard-page">

      <div className="service-dashboard-container">

        <header className="service-header">

          <div>
            {/* <span className="service-label">
              VEHICLE SERVICE & MAINTENANCE TRACKER
            </span> */}

            <h1>
              Service Center Dashboard
            </h1>

            {/* <p>
              Welcome back. Manage vehicle servicing
              and maintenance requirements.
            </p> */}
          </div>

          {/* <div className="service-user"> */}
{/* 
            <div className="service-avatar">
              SC
            </div> */}

            {/* <div>
              <span>
                Account
              </span>

              <strong>
                {user?.role || "Service Center"}
              </strong>
            </div> */}

          {/* </div> */}

        </header>

        {error && (
          <div className="service-error">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <section className="service-summary">

          <div className="service-summary-card">

            <div className="summary-icon blue">
              🔎
            </div>

            <div>
              <span>
                Vehicle Search
              </span>

              <strong>
                Search
              </strong>
            </div>

          </div>

          <div className="service-summary-card">

            <div className="summary-icon red">
              !
            </div>

            <div>
              <span>
                Overdue Vehicles
              </span>

              <strong>
                {overdueVehicles.length}
              </strong>
            </div>

          </div>

          <div className="service-summary-card">

            <div className="summary-icon green">
              ✓
            </div>

            <div>
              <span>
                Service Management
              </span>

              <strong>
                Ready
              </strong>
            </div>

          </div>

        </section>

        {/* QUICK ACTIONS */}

        <section className="service-actions">

          <div className="action-card">

            <div className="action-icon">
              🔎
            </div>

            <div className="action-content">

              <h2>
                Find a Vehicle
              </h2>

              <p>
                Search any registered vehicle by
                registration number.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/service-center/search"
                  )
                }
              >
                Search Vehicle →
              </button>

            </div>

          </div>

          <div className="action-card overdue-action">

            <div className="action-icon">
              !
            </div>

            <div className="action-content">

              <h2>
                Overdue Vehicles
              </h2>

              <p>
                View vehicles that have reached their
                service interval.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/service-center/overdue"
                  )
                }
              >
                View Overdue →
              </button>

            </div>

          </div>

        </section>

        {/* RECENT OVERDUE */}

        <section className="recent-section">

          <div className="recent-header">

            <div>
              <span>
                MAINTENANCE
              </span>

              <h2>
                Overdue Vehicles
              </h2>

              <p>
                Vehicles currently requiring service.
              </p>
            </div>

            {overdueVehicles.length > 0 && (
              <button
                className="view-all-button"
                onClick={() =>
                  router.push(
                    "/service-center/overdue"
                  )
                }
              >
                View All →
              </button>
            )}

          </div>

          {overdueVehicles.length === 0 ? (

            <div className="no-overdue">

              <div className="no-overdue-icon">
                ✓
              </div>

              <h3>
                No overdue vehicles
              </h3>

              <p>
                All currently tracked vehicles are
                within their service interval.
              </p>

            </div>

          ) : (

            <div className="recent-grid">

              {overdueVehicles
                .slice(0, 3)
                .map((vehicle) => (

                  <div
                    className="recent-card"
                    key={vehicle.vehicleId}
                  >

                    <div className="recent-card-top">

                      <div>
                        <span>
                          {vehicle.registrationNumber}
                        </span>

                        <h3>
                          {vehicle.make}{" "}
                          {vehicle.model}
                        </h3>
                      </div>

                      <div className="recent-warning">
                        !
                      </div>

                    </div>

                    <div className="recent-details">

                      <div>
                        <span>
                          Current Mileage
                        </span>

                        <strong>
                          {vehicle.currentMileage.toLocaleString()} km
                        </strong>
                      </div>

                      <div>
                        <span>
                          Next Service
                        </span>

                        <strong>
                          {new Date(
                            vehicle.nextServiceDue
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </strong>
                      </div>

                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/service-center/search?registrationNumber=${encodeURIComponent(
                            vehicle.registrationNumber
                          )}`
                        )
                      }
                    >
                      View Vehicle →
                    </button>

                  </div>

                ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default function ServiceCenterDashboard() {
  return (
    <AuthGuard allowedRole="ServiceCenter">
      <ServiceCenterDashboardContent />
    </AuthGuard>
  );
}