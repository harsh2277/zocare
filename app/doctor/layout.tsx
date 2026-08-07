"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { DoctorSidebar } from "@/components/app/doctor-sidebar";
import { DoctorTopBar } from "@/components/app/doctor-top-bar";

import { useEffect } from "react";

import { getCurrentStaff } from "@/lib/auth";

const FULLSCREEN_ROUTES = ["/doctor/signin", "/doctor/signup", "/doctor/forgot-password", "/doctor/prescription"];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (isFullscreen) return;
    // Proxy already gates this route; this catches a session that expired in
    // an open tab.
    getCurrentStaff("doctor").then((profile) => {
      if (!profile) router.replace("/doctor/signin");
    });
  }, [isFullscreen, pathname, router]);

  if (isFullscreen) {
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

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
