

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import "./vehicle.css";
import AuthGuard from "@/app/components/AuthGuard";

interface CreateVehicleResponse {
  success: boolean;
  message: string;
  vehicleId: number;
}

 function AddVehiclePage() {
  const router = useRouter();

  const [registrationNumber, setRegistrationNumber] =
    useState("");

  const [make, setMake] = useState("");

  const [model, setModel] = useState("");

  const [currentMileage, setCurrentMileage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const mileage =
        Number(currentMileage);

      if (
        !Number.isInteger(mileage) ||
        mileage < 0
      ) {
        throw new Error(
          "Please enter a valid mileage."
        );
      }

      const response =
        await apiRequest<CreateVehicleResponse>(
          "/api/vehicles",
          {
            method: "POST",
            body: JSON.stringify({
              registrationNumber,
              make,
              model,
              currentMileage: mileage,
            }),
          }
        );

      setSuccess(
        response.message
      );

      setTimeout(() => {
        router.push(
          "/owner/dashboard"
        );
      }, 800);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create vehicle."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="vehicle-page">

      <div className="vehicle-container">

        <button
          className="back-button"
          type="button"
          onClick={() =>
            router.push(
              "/owner/dashboard"
            )
          }
        >
          ← Back to Dashboard
        </button>

        <div className="vehicle-header">
          <span>
            VEHICLE MANAGEMENT
          </span>

          <h1>Add New Vehicle</h1>

          <p>
            Register your vehicle to start
            tracking its maintenance history.
          </p>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert success">
            {success}
          </div>
        )}

        <form
          className="vehicle-form"
          onSubmit={handleSubmit}
        >

          <div className="form-section">

            <h2>
              Vehicle Information
            </h2>

            <p className="section-description">
              Enter the basic details of your
              vehicle.
            </p>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Registration Number
                </label>

                <input
                  type="text"
                  value={
                    registrationNumber
                  }
                  onChange={(e) =>
                    setRegistrationNumber(
                      e.target.value
                    )
                  }
                  placeholder="e.g. MH12AB1234"
                  maxLength={50}
                  required
                />

                <small>
                  Enter the vehicle registration
                  number.
                </small>
              </div>

              <div className="form-group">
                <label>
                  Make
                </label>

                <input
                  type="text"
                  value={make}
                  onChange={(e) =>
                    setMake(e.target.value)
                  }
                  placeholder="e.g. Toyota"
                  maxLength={100}
                  required
                />

                <small>
                  Vehicle manufacturer.
                </small>
              </div>

              <div className="form-group">
                <label>
                  Model
                </label>

                <input
                  type="text"
                  value={model}
                  onChange={(e) =>
                    setModel(e.target.value)
                  }
                  placeholder="e.g. Corolla"
                  maxLength={100}
                  required
                />

                <small>
                  Vehicle model name.
                </small>
              </div>

              <div className="form-group">
                <label>
                  Current Mileage
                </label>

                <div className="mileage-input">
                  <input
                    type="number"
                    value={currentMileage}
                    onChange={(e) =>
                      setCurrentMileage(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 45000"
                    min="0"
                    required
                  />

                  <span>km</span>
                </div>

                <small>
                  Current odometer reading.
                </small>
              </div>

            </div>

          </div>

          <div className="form-footer">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                router.push(
                  "/owner/dashboard"
                )
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Vehicle"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

  export default function ProtectedPage() {
  return (
    <AuthGuard allowedRole="Owner">
      <AddVehiclePage />
    </AuthGuard>
  );
}