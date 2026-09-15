

"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { UserRole } from "@/lib/auth";

interface CurrentUserResponse {
  success: boolean;
  userId: number;
  role: UserRole;
}

interface AuthGuardProps {
  allowedRole: UserRole;
  children: ReactNode;
}

export default function AuthGuard({
  allowedRole,
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const user =
          await apiRequest<CurrentUserResponse>(
            "/api/auth/me"
          );

        if (user.role !== allowedRole) {
          router.replace("/login");
          return;
        }

        setAuthorized(true);
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };

    checkAuthentication();
  }, [allowedRole, router]);

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Checking authentication...</p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}