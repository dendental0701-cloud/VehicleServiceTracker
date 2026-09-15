

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import "./overdue.css";

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function OverdueVehiclesPage() {
  const router = useRouter();

  const [vehicles, setVehicles] =
    useState<OverdueVehicle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOverdueVehicles = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await apiRequest<OverdueVehiclesResponse>(
            "/api/service-centers/overdue-vehicles"
          );

        setVehicles(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load overdue vehicles."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverdueVehicles();
  }, []);

  if (loading) {
    return (
      <main className="overdue-page">
        <div className="overdue-loading">
          <div className="overdue-spinner"></div>

          <p>
            Checking overdue vehicles...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="overdue-page">

      <div className="overdue-container">

        <button
          className="overdue-back"
          onClick={() =>
            router.push(
              "/service-center/dashboard"
            )
          }
        >
          ← Back to Dashboard
        </button>

        <header className="overdue-header">

          <div>
            <span>
              SERVICE CENTER
            </span>

            <h1>
              Overdue Vehicles
            </h1>

            <p>
              Vehicles that have reached their
              scheduled or mileage-based service
              interval.
            </p>
          </div>

          <div className="overdue-count">

            <strong>
              {vehicles.length}
            </strong>

            <span>
              {vehicles.length === 1
                ? "Vehicle"
                : "Vehicles"}
            </span>

          </div>

        </header>

        {error && (
          <div className="overdue-error">
            {error}
          </div>
        )}

        {vehicles.length === 0 ? (

          <section className="overdue-empty">

            <div className="empty-icon">
              ✓
            </div>

            <h2>
              No overdue vehicles
            </h2>

            <p>
              Great! There are currently no vehicles
              requiring overdue service.
            </p>

          </section>

        ) : (

          <section className="overdue-list">

            {vehicles.map((vehicle) => (

              <article
                className="overdue-card"
                key={vehicle.vehicleId}
              >

                <div className="vehicle-main">

                  <div className="vehicle-icon">
                    🚘
                  </div>

                  <div>

                    <span className="vehicle-registration">
                      {vehicle.registrationNumber}
                    </span>

                    <h2>
                      {vehicle.make}{" "}
                      {vehicle.model}
                    </h2>

                  </div>

                </div>

                <div className="overdue-status">

                  {vehicle.dateOverdue && (
                    <span className="status-badge date">
                      Date overdue
                    </span>
                  )}

                  {vehicle.mileageOverdue && (
                    <span className="status-badge mileage">
                      Mileage overdue
                    </span>
                  )}

                </div>

                <div className="vehicle-stats">

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
                      Last Service
                    </span>

                    <strong>
                      {formatDate(
                        vehicle.lastServiceDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Last Service Mileage
                    </span>

                    <strong>
                      {vehicle.lastServiceMileage.toLocaleString()} km
                    </strong>
                  </div>

                  <div>
                    <span>
                      Next Service Due
                    </span>

                    <strong className="due-date">
                      {formatDate(
                        vehicle.nextServiceDue
                      )}
                    </strong>
                  </div>

                </div>

                <div className="overdue-footer">

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

              </article>

            ))}

          </section>

        )}

      </div>

    </main>
  );
}