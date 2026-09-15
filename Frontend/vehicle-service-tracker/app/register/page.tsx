

"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { UserRole } from "@/lib/auth";

import "./register.css";

interface RegisterResponse {
  success: boolean;
  message: string;
  userId: number;
}

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] =
    useState<UserRole>("Owner");

  const [fullName, setFullName] =
    useState("");

  const [serviceCenterName, setServiceCenterName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [address, setAddress] =
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
      let endpoint = "";

      let requestBody: object = {};

      if (role === "Owner") {
        endpoint =
          "/api/auth/owner/register";

        requestBody = {
          fullName,
          email,
          password,
        };
      } else {
        endpoint =
          "/api/auth/service-center/register";

        requestBody = {
          name: serviceCenterName,
          email,
          password,
          address,
        };
      }

      const response =
        await apiRequest<RegisterResponse>(
          endpoint,
          {
            method: "POST",
            body: JSON.stringify(
              requestBody
            ),
          }
        );

      setSuccess(response.message);

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">

      <div className="register-card">

        <div className="register-header">

          <div className="register-logo">
            🚘
          </div>

          <span className="register-label">
            VEHICLE SERVICE & MAINTENANCE TRACKER
          </span>

          <h1>
            Create Account
          </h1>

          <p>
            Register to start using the
            vehicle service tracker.
          </p>

        </div>

        {error && (
          <div className="register-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="register-alert success">
            {success}
          </div>
        )}

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          <div className="register-field">

            <label>
              Account Type
            </label>

            <select
              value={role}
              onChange={(e) => {
                setRole(
                  e.target.value as UserRole
                );

                setError("");
                setSuccess("");
              }}
            >
              <option value="Owner">
                Owner
              </option>

              <option value="ServiceCenter">
                Service Center
              </option>
            </select>

          </div>

          {role === "Owner" ? (

            <div className="register-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                placeholder="Enter your full name"
                maxLength={150}
                required
              />

            </div>

          ) : (

            <>
              <div className="register-field">

                <label>
                  Service Center Name
                </label>

                <input
                  type="text"
                  value={serviceCenterName}
                  onChange={(e) =>
                    setServiceCenterName(
                      e.target.value
                    )
                  }
                  placeholder="Enter service center name"
                  maxLength={150}
                  required
                />

              </div>

              <div className="register-field">

                <label>
                  Address
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter service center address"
                  maxLength={500}
                  rows={3}
                />

              </div>
            </>

          )}

          <div className="register-field">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
            />

          </div>

          <div className="register-field">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />

          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="login-link">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
          >
            Sign In
          </button>

        </div>

      </div>

    </main>
  );
}