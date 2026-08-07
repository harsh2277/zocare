"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReceptionistSidebar } from "@/components/app/receptionist-sidebar";
import { ReceptionistNavbar } from "@/components/app/receptionist-navbar";
import { getCurrentStaff } from "@/lib/auth";

export default function ReceptionistPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Proxy already gates this route; this re-syncs the cached receptionist id
    // (and catches a session that expired while the tab sat open).
    getCurrentStaff("receptionist").then((profile) => {
      if (!profile) router.replace("/receptionist/login");
    });
  }, [router]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <ReceptionistSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden h-14" />
        <ReceptionistNavbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
