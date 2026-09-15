"use client";

import { useRouter } from "next/navigation";
import "./home.css";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="home-page">

      <header className="home-header">

        <div
          className="home-brand"
          onClick={() =>
            router.push("/")
          }
        >
          <span className="home-brand-icon">
            🚘
          </span>

          <span>
            Vehicle Service Tracker
          </span>
        </div>

        <div className="home-header-actions">

          <button
            className="home-login-button"
            onClick={() =>
              router.push("/login")
            }
          >
            Sign In
          </button>

          <button
            className="home-register-button"
            onClick={() =>
              router.push("/register")
            }
          >
            Create Account
          </button>

        </div>

      </header>

      <section className="hero-section">

        <div className="hero-content">

          <span className="hero-label">
            VEHICLE SERVICE & MAINTENANCE TRACKER
          </span>

          <h1>
            Keep your vehicle
            <span>
              ready for the road.
            </span>
          </h1>

          <p>
            Track vehicle details, maintenance
            history, service records and upcoming
            service requirements in one place.
          </p>

          <div className="hero-actions">

            <button
              className="hero-primary"
              onClick={() =>
                router.push("/login")
              }
            >
              Get Started →
            </button>

            <button
              className="hero-secondary"
              onClick={() =>
                router.push("/register")
              }
            >
              Create Account
            </button>

          </div>

        </div>

        <div className="hero-card">

          <div className="hero-car-icon">
            🚗
          </div>

          <div className="hero-card-content">

            <span>
              MAINTENANCE TRACKING
            </span>

            <h2>
              Everything in one place
            </h2>

            <p>
              Manage vehicles, service records and
              maintenance schedules with a simple
              dashboard.
            </p>

          </div>

          <div className="hero-stats">

            <div>
              <strong>
                4
              </strong>

              <span>
                Core Data Areas
              </span>
            </div>

            <div>
              <strong>
                2
              </strong>

              <span>
                User Roles
              </span>
            </div>

            <div>
              <strong>
                1
              </strong>

              <span>
                Service Timeline
              </span>
            </div>

          </div>

        </div>

      </section>

      <section className="features-section">

        <div className="feature-card">

          <div className="feature-icon">
            🚘
          </div>

          <h3>
            Manage Vehicles
          </h3>

          <p>
            Keep all your vehicle information
            organized and accessible.
          </p>

        </div>

        <div className="feature-card">

          <div className="feature-icon">
            🔧
          </div>

          <h3>
            Service History
          </h3>

          <p>
            Maintain a clear timeline of service
            and maintenance activities.
          </p>

        </div>

        <div className="feature-card">

          <div className="feature-icon">
            ⚠
          </div>

          <h3>
            Service Alerts
          </h3>

          <p>
            Identify vehicles that have reached
            their service interval.
          </p>

        </div>

      </section>

    </main>
  );
}