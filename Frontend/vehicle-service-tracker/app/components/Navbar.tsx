

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { UserRole } from "@/lib/auth";
import "./Navbar.css";

interface CurrentUser {
  success: boolean;
  userId: number;
  role: UserRole;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] =
    useState<UserRole | null>(null);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response =
          await apiRequest<CurrentUser>(
            "/api/auth/me"
          );

        setRole(response.role);
      } catch {
        setRole(null);
      }
    };

    loadUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await apiRequest(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } catch {
      // Even if the request fails,
      // return the user to login.
    } finally {
      setLoggingOut(false);
      router.replace("/login");
    }
  };

  if (!role) {
    return null;
  }

  const isOwner = role === "Owner";

  return (
    <nav className="navbar">

      <div className="navbar-container">

        <button
          className="navbar-brand"
          onClick={() =>
            router.push(
              isOwner
                ? "/owner/dashboard"
                : "/service-center/dashboard"
            )
          }
        >
          <span className="brand-icon">
            🚘
          </span>

          <span>
            Vehicle Service Tracker
          </span>
        </button>

        <div className="navbar-links">

          {isOwner ? (
            <>
              <button
                className={
                  pathname ===
                  "/owner/dashboard"
                    ? "nav-link active"
                    : "nav-link"
                }
                onClick={() =>
                  router.push(
                    "/owner/dashboard"
                  )
                }
              >
                Dashboard
              </button>

            </>
          ) : (
            <>
              <button
                className={
                  pathname ===
                  "/service-center/dashboard"
                    ? "nav-link active"
                    : "nav-link"
                }
                onClick={() =>
                  router.push(
                    "/service-center/dashboard"
                  )
                }
              >
                Dashboard
              </button>

              <button
                className={
                  pathname ===
                  "/service-center/search"
                    ? "nav-link active"
                    : "nav-link"
                }
                onClick={() =>
                  router.push(
                    "/service-center/search"
                  )
                }
              >
                Find Vehicle
              </button>

              <button
                className={
                  pathname ===
                  "/service-center/overdue"
                    ? "nav-link active"
                    : "nav-link"
                }
                onClick={() =>
                  router.push(
                    "/service-center/overdue"
                  )
                }
              >
                Overdue Vehicles
              </button>
            </>
          )}

        </div>

        <div className="navbar-right">

          <span className="role-label">
            {isOwner
              ? "Owner"
              : "Service Center"}
          </span>

          <button
            className="logout-nav-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>

        </div>

      </div>

    </nav>
  );
}