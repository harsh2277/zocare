"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { DoctorSidebar } from "@/components/app/doctor-sidebar";
import { DoctorTopBar } from "@/components/app/doctor-top-bar";

// Auth screens (sign in / sign up / forgot password) render full-screen without the sidebar.
const AUTH_ROUTES = ["/doctor/signin", "/doctor/signup", "/doctor/forgot-password"];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="hidden lg:block shrink-0">
          <DoctorTopBar />
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Mobile top bar spacer */}
          <div className="lg:hidden h-14" />
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
