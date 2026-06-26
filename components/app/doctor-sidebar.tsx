"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  TaskDaily01Icon,
  UserMultiple02Icon,
  Invoice03Icon,
  BarChartIcon,
  Settings01Icon,
  HelpCircleIcon,
  PlusSignIcon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

const menuItems: NavItem[] = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: DashboardSquare01Icon },
  { label: "Queue", href: "/doctor/queue", icon: TaskDaily01Icon },
  { label: "My Patients", href: "/doctor/patients", icon: UserGroupIcon },
];

const adminItems: NavItem[] = [
  { label: "Users & Staff", href: "/doctor/staff", icon: UserMultiple02Icon },
  { label: "Billing", href: "/doctor/billing", icon: Invoice03Icon },
  { label: "Reports", href: "/doctor/reports", icon: BarChartIcon },
];

const systemItems: NavItem[] = [
  { label: "Settings", href: "/doctor/settings", icon: Settings01Icon },
  { label: "Help", href: "/doctor/help", icon: HelpCircleIcon },
];

export const DoctorSidebar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
          active
            ? "bg-primary-600 text-white"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        }`}
      >
        <HugeiconsIcon
          icon={item.icon}
          className={`w-4.5 h-4.5 shrink-0 ${
            active ? "text-white" : "text-neutral-400 group-hover:text-neutral-600"
          }`}
        />
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-neutral-900">Doctor Portal</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Menu</p>
          <nav className="space-y-0.5">
            {menuItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Admin</p>
          <nav className="space-y-0.5">
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">System</p>
          <nav className="space-y-0.5">
            {systemItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-48 shrink-0 bg-white border-r border-neutral-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-neutral-900">Doctor Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
        >
          <HugeiconsIcon icon={Menu01Icon} className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-neutral-200 flex flex-col animate-drawer-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <span className="text-sm font-bold text-neutral-900">Doctor Portal</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                <HugeiconsIcon icon={Cancel01Icon} className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </>
      )}
    </>
  );
};
