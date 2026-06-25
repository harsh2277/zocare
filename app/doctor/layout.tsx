import React from "react";
import { DoctorSidebar } from "@/components/app/doctor-sidebar";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <DoctorSidebar />
      <main className="flex-1 min-w-0 lg:overflow-y-auto">
        {/* Mobile top bar spacer */}
        <div className="lg:hidden h-14" />
        <div className="p-5 lg:p-7 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
