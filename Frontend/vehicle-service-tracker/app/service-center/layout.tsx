import AuthGuard from "@/app/components/AuthGuard";
import Navbar from "@/app/components/Navbar";
import { ReactNode } from "react";

interface ServiceCenterLayoutProps {
  children: ReactNode;
}

export default function ServiceCenterLayout({
  children,
}: ServiceCenterLayoutProps) {
  return (
    <AuthGuard allowedRole="ServiceCenter">
      <Navbar />
      {children}
    </AuthGuard>
  );
}