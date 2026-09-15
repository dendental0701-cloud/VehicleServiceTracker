
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { apiRequest } from "@/lib/api";
import "./service.css";

interface Vehicle {
  vehicleId: number;
  registrationNumber: string;
  make: string;
  model: string;
  currentMileage: number;
}

interface VehicleResponse {
  success: boolean;
  data: Vehicle;
}

interface CreateServiceResponse {
  success: boolean;
  message: string;
  serviceRecordId: number;
}

export default function NewServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registrationNumber =
    searchParams.get("registrationNumber");

  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [serviceDate, setServiceDate] =
    useState("");

  const [mileageAtService, setMileageAtService] =
    useState("");

  const [workDone, setWorkDone] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadVehicle = async () => {
      if (!registrationNumber) {
        setError(
          "Registration number was not provided."
        );

        setLoading(false);
        return;
      }

      try {
        const response =
          await apiRequest<VehicleResponse>(
            `/api/service-centers/vehicles/search?registrationNumber=${encodeURIComponent(
              registrationNumber
            )}`
          );

        setVehicle(response.data);
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

    loadVehicle();
  }, [registrationNumber]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const mileage =
        Number(mileageAtService);

      if (
        !Number.isInteger(mileage) ||
        mileage < 0
      ) {
        throw new Error(
          "Please enter a valid mileage."
        );
      }

      if (!vehicle) {
        throw new Error(
          "Vehicle was not selected."
        );
      }

      const response =
        await apiRequest<CreateServiceResponse>(
          "/api/service-records",
          {
            method: "POST",
            body: JSON.stringify({
              vehicleId: vehicle.vehicleId,
              serviceDate,
              mileageAtService: mileage,
              workDone,
            }),
          }
        );

      setSuccess(response.message);

      setTimeout(() => {
        router.push(
          "/service-center/search"
        );
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save service record."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="service-page">
        <div className="service-loading">
          <div className="service-spinner"></div>

          <p>
            Loading vehicle information...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="service-page">

      <div className="service-container">

        <button
          className="service-back"
          onClick={() =>
            router.push(
              "/service-center/search"
            )
          }
        >
          ← Back to Vehicle Search
        </button>

        <div className="service-heading">

          <span>
            SERVICE CENTER
          </span>

          <h1>
            Log Service
          </h1>

          <p>
            Record the maintenance performed on
            this vehicle.
          </p>

        </div>

        {error && (
          <div className="service-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="service-alert success">
            {success}
          </div>
        )}

        {vehicle && (
          <>

            <section className="vehicle-banner">

              <div className="vehicle-banner-icon">
                🚘
              </div>

              <div>
                <span>
                  VEHICLE
                </span>

                <h2>
                  {vehicle.make}{" "}
                  {vehicle.model}
                </h2>

                <strong>
                  {vehicle.registrationNumber}
                </strong>
              </div>

              <div className="current-mileage">

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

            <form
              className="service-form"
              onSubmit={handleSubmit}
            >

              <div className="service-form-section">

                <h2>
                  Service Information
                </h2>

                <p>
                  Enter the details of the maintenance
                  performed today.
                </p>

                <div className="service-form-grid">

                  <div className="service-field">

                    <label>
                      Service Date
                    </label>

                    <input
                      type="date"
                      value={serviceDate}
                      onChange={(e) =>
                        setServiceDate(
                          e.target.value
                        )
                      }
                      max={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      required
                    />

                  </div>

                  <div className="service-field">

                    <label>
                      Mileage at Service
                    </label>

                    <div className="service-mileage">

                      <input
                        type="number"
                        value={
                          mileageAtService
                        }
                        onChange={(e) =>
                          setMileageAtService(
                            e.target.value
                          )
                        }
                        min="0"
                        placeholder="e.g. 50000"
                        required
                      />

                      <span>
                        km
                      </span>

                    </div>

                  </div>

                </div>

                <div className="service-field full">

                  <label>
                    Work Performed
                  </label>

                  <textarea
                    value={workDone}
                    onChange={(e) =>
                      setWorkDone(
                        e.target.value
                      )
                    }
                    placeholder="Describe the maintenance or repairs performed..."
                    maxLength={5000}
                    rows={6}
                    required
                  />

                  <small>
                    Include important maintenance,
                    repairs, inspections, or parts
                    replaced.
                  </small>

                </div>

              </div>

              <div className="service-footer">

                <button
                  type="button"
                  className="service-cancel"
                  onClick={() =>
                    router.push(
                      "/service-center/search"
                    )
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="service-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Service Record"}
                </button>

              </div>

            </form>

          </>
        )}

      </div>

    </main>
  );
}

