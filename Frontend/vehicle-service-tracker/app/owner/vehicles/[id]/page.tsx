

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import AuthGuard from "@/app/components/AuthGuard";
import "./vehicle-details.css";

interface Vehicle {
  vehicleId: number;
  ownerId: number;
  registrationNumber: string;
  make: string;
  model: string;
  currentMileage: number;
  createdAt: string;
}

interface VehicleResponse {
  success: boolean;
  data: Vehicle;
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

 function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const vehicleId = params.id as string;

  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [serviceHistory, setServiceHistory] =
    useState<ServiceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const loadVehicle = async () => {
      try {
        setLoading(true);
        setError("");

        const vehicleResponse =
          await apiRequest<VehicleResponse>(
            `/api/vehicles/${vehicleId}`
          );

        setVehicle(vehicleResponse.data);

        const historyResponse =
          await apiRequest<ServiceHistoryResponse>(
            `/api/vehicles/${vehicleId}/service-history`
          );

        setServiceHistory(
          historyResponse.data
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load vehicle."
        );
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  if (loading) {
    return (
      <main className="details-page">
        <div className="details-loading">
          <div className="details-spinner"></div>
          <p>
            Loading vehicle details...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="details-page">
        <div className="details-container">
          <button className="back-link"
                onClick={() =>
             router.push(
               "/owner/dashboard"
                 )
              }
            >
                ← My Vehicles
             </button>

          <div className="error-card">
            <div className="error-icon">
              !
            </div>

            <h2>
              Unable to load vehicle
            </h2>

            <p>{error}</p>

            <button
              onClick={() =>
                router.push(
                  "/owner/dashboard"
                )
              }
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!vehicle) {
    return null;
  }


  return (
    <main className="details-page">

      <div className="details-container">

        <button className="back-link"
               onClick={() =>
                 router.push(
                  "/owner/dashboard"
                    )
                  }
               >
                 ← My Vehicles
            </button>

        <section className="vehicle-summary">

          <div className="summary-icon">
            🚘
          </div>

          <div className="summary-content">

            <span className="summary-label">
              VEHICLE
            </span>

            <h1>
              {vehicle.make}{" "}
              {vehicle.model}
            </h1>

            <span className="registration-badge">
              {vehicle.registrationNumber}
            </span>

          </div>

          <div className="mileage-box">

            <span>
              Current Mileage
            </span>

            <strong>
              {vehicle.currentMileage.toLocaleString()}
            </strong>

            <small>
              km
            </small>

          </div>

        </section>

        <section className="details-card">

          <div className="card-heading">
            <div>
              <h2>
                Vehicle Information
              </h2>

              <p>
                Basic information about your vehicle.
              </p>
            </div>
          </div>

          <div className="info-grid">

            <div className="info-item">
              <span>
                Registration Number
              </span>

              <strong>
                {vehicle.registrationNumber}
              </strong>
            </div>

            <div className="info-item">
              <span>
                Make
              </span>

              <strong>
                {vehicle.make}
              </strong>
            </div>

            <div className="info-item">
              <span>
                Model
              </span>

              <strong>
                {vehicle.model}
              </strong>
            </div>

            <div className="info-item">
              <span>
                Current Mileage
              </span>

              <strong>
                {vehicle.currentMileage.toLocaleString()} km
              </strong>
            </div>

          </div>

        </section>

        <section className="history-section">

          <div className="history-heading">

            <div>
              <span className="section-label">
                MAINTENANCE
              </span>

              <h2>
                Service History
              </h2>

              <p>
                Complete maintenance history for
                this vehicle.
              </p>
            </div>

            <div className="history-count">
              {serviceHistory.length}
              <span>
                {serviceHistory.length === 1
                  ? "Service"
                  : "Services"}
              </span>
            </div>

          </div>

          {serviceHistory.length === 0 ? (

            <div className="no-history">

              <div className="history-icon">
                🔧
              </div>

              <h3>
                No service history yet
              </h3>

              <p>
                Service records will appear here
                once the vehicle is serviced.
              </p>

            </div>

          ) : (

            <div className="timeline">

              {serviceHistory.map(
                (record, index) => (

                  <div
                    className="timeline-item"
                    key={
                      record.serviceRecordId
                    }
                  >

                    <div className="timeline-marker">
                      <div></div>
                    </div>

                    <div className="timeline-card">

                      <div className="service-top">

                        <div>
                          <span className="service-date">
                            {formatDate(
                              record.serviceDate
                            )}
                          </span>

                          <h3>
                            Service #{serviceHistory.length - index}
                          </h3>
                        </div>

                        <span className="service-badge">
                          Completed
                        </span>

                      </div>

                      <div className="service-details">

                        <div className="service-detail">

                          <span>
                            Mileage at Service
                          </span>

                          <strong>
                            {record.mileageAtService.toLocaleString()} km
                          </strong>

                        </div>

                        <div className="service-detail">

                          <span>
                            Next Service Due
                          </span>

                          <strong>
                            {formatDate(
                              record.nextServiceDue
                            )}
                          </strong>

                        </div>

                      </div>

                      <div className="work-done">

                        <span>
                          Work Performed
                        </span>

                        <p>
                          {record.workDone}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default function ProtectedPage() {
  return (
    <AuthGuard allowedRole="Owner">
      <VehicleDetailsPage />
    </AuthGuard>
  );
}