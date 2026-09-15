import AuthGuard from "@/app/components/AuthGuard";
import Navbar from "@/app/components/Navbar";
import { ReactNode } from "react";

interface OwnerLayoutProps {
  children: ReactNode;
}

export default function OwnerLayout({
  children,
}: OwnerLayoutProps) {
  return (
    <AuthGuard allowedRole="Owner">
      <Navbar />
      {children}
    </AuthGuard>
  );
}