import React from "react";
import { ReceptionistSidebar } from "@/components/app/receptionist-sidebar";
import { ReceptionistNavbar } from "@/components/app/receptionist-navbar";

export default function ReceptionistPortalLayout({ children }: { children: React.ReactNode }) {
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
