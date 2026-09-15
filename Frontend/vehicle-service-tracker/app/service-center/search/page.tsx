
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
import "./search.css";

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

export default function VehicleSearchPage() {
  const router = useRouter();

  // ADD THIS
  const searchParams = useSearchParams();

  const [registrationNumber, setRegistrationNumber] =
    useState("");

  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // REUSABLE SEARCH FUNCTION
  // ==========================================

  const searchVehicle = async (
    registration: string
  ) => {
    setLoading(true);
    setError("");
    setVehicle(null);

    try {
      const normalizedRegistration =
        registration.trim().toUpperCase();

      if (!normalizedRegistration) {
        throw new Error(
          "Please enter a registration number."
        );
      }

      setRegistrationNumber(
        normalizedRegistration
      );

      const response =
        await apiRequest<VehicleResponse>(
          `/api/service-centers/vehicles/search?registrationNumber=${encodeURIComponent(
            normalizedRegistration
          )}`
        );

      setVehicle(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Vehicle search failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // NORMAL SEARCH BUTTON
  // ==========================================

  const handleSearch = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await searchVehicle(
      registrationNumber
    );
  };

  // ==========================================
  // AUTOMATIC SEARCH FROM URL
  // ==========================================

  useEffect(() => {
    const registration =
      searchParams.get(
        "registrationNumber"
      );

    if (registration) {
      searchVehicle(registration);
    }
  }, [searchParams]);

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="search-page">

      <div className="search-container">

        <button
          className="back-button"
          onClick={() =>
            router.push(
              "/service-center/dashboard"
            )
          }
        >
          ← Back to Dashboard
        </button>

        <div className="search-header">

          <span>
            SERVICE CENTER
          </span>

          <h1>
            Find a Vehicle
          </h1>

          <p>
            Search for any registered vehicle using
            its registration number.
          </p>

        </div>

        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <div className="search-input-wrapper">

            <input
              type="text"
              value={registrationNumber}
              onChange={(e) =>
                setRegistrationNumber(
                  e.target.value
                )
              }
              placeholder="Enter registration number"
              maxLength={50}
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Search"}
            </button>

          </div>
        </form>

        {error && (
          <div className="search-error">
            {error}
          </div>
        )}

        {vehicle && (
          <section className="vehicle-result">

            <div className="result-header">

              <div className="result-icon">
                🚘
              </div>

              <div>

                <span>
                  VEHICLE FOUND
                </span>

                <h2>
                  {vehicle.make}{" "}
                  {vehicle.model}
                </h2>

                <strong>
                  {vehicle.registrationNumber}
                </strong>

              </div>

            </div>

            <div className="result-grid">

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
                  Vehicle ID
                </span>

                <strong>
                  #{vehicle.vehicleId}
                </strong>
              </div>

              <div>
                <span>
                  Owner ID
                </span>

                <strong>
                  #{vehicle.ownerId}
                </strong>
              </div>

            </div>

            <div className="result-actions">

              <button
                className="service-button"
                onClick={() =>
                  router.push(
                    `/service-center/service/new?registrationNumber=${encodeURIComponent(
                      vehicle.registrationNumber
                    )}`
                  )
                }
              >
                Log Service →
              </button>

            </div>

          </section>
        )}

      </div>

    </main>
  );
}

