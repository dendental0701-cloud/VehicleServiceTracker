"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import {
  LoginResponse,
  UserRole,
} from "@/lib/auth";

import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] =
    useState<UserRole>("Owner");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const currentUser =
          await apiRequest<LoginResponse>(
            "/api/auth/me"
          );

        if (currentUser.role === "Owner") {
          router.replace(
            "/owner/dashboard"
          );
        } else if (
          currentUser.role ===
          "ServiceCenter"
        ) {
          router.replace(
            "/service-center/dashboard"
          );
        }
      } catch {
        // No active session.
        // Stay on the login page.
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint =
        role === "Owner"
          ? "/api/auth/owner/login"
          : "/api/auth/service-center/login";

      const response =
        await apiRequest<LoginResponse>(
          endpoint,
          {
            method: "POST",
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      if (response.role === "Owner") {
        router.replace(
          "/owner/dashboard"
        );
      } else {
        router.replace(
          "/service-center/dashboard"
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
  return (
    <main className="login-page">

      <div className="login-background-glow"></div>

      <div
        className="particle"
        style={{
          left: "15%",
          animationDuration: "10s",
        }}
      />

      <div
        className="particle"
        style={{
          left: "40%",
          animationDuration: "14s",
          animationDelay: "2s",
        }}
      />

      <div
        className="particle"
        style={{
          left: "70%",
          animationDuration: "12s",
          animationDelay: "4s",
        }}
      />

      <div className="login-loading">

        <div className="login-spinner"></div>

        <p>
          Checking your session...
        </p>

      </div>

    </main>
  );
}

  return (
  <main className="login-page">

    <div className="login-background-glow"></div>

    <div
      className="particle"
      style={{
        left: "8%",
        animationDuration: "9s",
        animationDelay: "0s",
      }}
    />

    <div
      className="particle"
      style={{
        left: "18%",
        animationDuration: "13s",
        animationDelay: "2s",
      }}
    />

    <div
      className="particle"
      style={{
        left: "32%",
        animationDuration: "11s",
        animationDelay: "4s",
      }}
    />

    <div
      className="particle"
      style={{
        left: "47%",
        animationDuration: "15s",
        animationDelay: "1s",
      }}
    />

    <div
      className="particle"
      style={{
        left: "61%",
        animationDuration: "10s",
        animationDelay: "3s",
      }}
    />

    <div
      className="particle"
      style={{
        left: "74%",
        animationDuration: "14s",
        animationDelay: "5s",
      }}
    />

    <div
      className="particle"
      style={{
        left: "88%",
        animationDuration: "12s",
        animationDelay: "6s",
      }}
    />

    <div className="login-card">

        <div className="login-header">

<div className="login-logo">
  <svg
    viewBox="0 0 64 64"
    width="52"
    height="52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 40L18 27C18.8 24.4 21.2 22.5 24 22.5H40C42.8 22.5 45.2 24.4 46 27L50 40"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M10 40H54V47C54 49.2 52.2 51 50 51H14C11.8 51 10 49.2 10 47V40Z"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    <path
      d="M18 32H46"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    <circle
      cx="19"
      cy="46"
      r="3.5"
      fill="currentColor"
    />

    <circle
      cx="45"
      cy="46"
      r="3.5"
      fill="currentColor"
    />
  </svg>
</div>

          <span className="login-label">
            VEHICLE SERVICE & MAINTENANCE TRACKER
          </span>

          <h2>
            Welcome Back
          </h2>

          {/* <p>
            Sign in to manage your vehicle
            maintenance.
          </p> */}

        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          <div className="login-field">

            {/* <label>
              Login As
            </label> */}

            <select
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value as UserRole
                )
              }
            >
              <option value="Owner">
                Owner
              </option>

              <option value="ServiceCenter">
                Service Center
              </option>
            </select>

          </div>

          <div className="login-field">

            {/* <label>
              Email
            </label> */}

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

          <div className="login-field">

            {/* <label>
              Password
            </label> */}

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter your password"
              required
            />

          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <div className="register-link">

          {/* <span>
            Don't have an account?
          </span> */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/register"
              )
            }
          >
            Create Account
          </button>

        </div>

      </div>

    </main>
  );
}