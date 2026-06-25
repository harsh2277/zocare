"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  TaskDaily01Icon,
  PrescriptionIcon,
  UserMultiple02Icon,
  Invoice03Icon,
  BarChartIcon,
  Settings01Icon,
  HelpCircleIcon,
  UserCircleIcon,
  LogoutSquare01Icon,
  StethoscopeIcon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

const navItems = [
  { label: "Dashboard",      href: "/doctor/dashboard",    icon: DashboardSquare01Icon },
  { label: "My Patients",    href: "/doctor/patients",     icon: UserGroupIcon         },
  { label: "Queue",          href: "/doctor/queue",        icon: TaskDaily01Icon       },
  { label: "Prescriptions",  href: "/doctor/prescription", icon: PrescriptionIcon      },
  { label: "Staff & Users",  href: "/doctor/staff",        icon: UserMultiple02Icon    },
  { label: "Billing",        href: "/doctor/billing",      icon: Invoice03Icon         },
  { label: "Reports",        href: "/doctor/reports",      icon: BarChartIcon        },
];

const bottomNavItems = [
  { label: "Settings", href: "/doctor/settings", icon: Settings01Icon  },
  { label: "Help",     href: "/doctor/help",     icon: HelpCircleIcon  },
  { label: "Profile",  href: "/doctor/profile",  icon: UserCircleIcon  },
];

export const DoctorSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/doctor/prescription") {
      return pathname.startsWith("/doctor/prescription");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
        isActive(item.href)
          ? "bg-primary-600 text-white"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      <HugeiconsIcon
        icon={item.icon}
        className={`w-4.5 h-4.5 shrink-0 ${isActive(item.href) ? "text-white" : "text-neutral-400 group-hover:text-neutral-600"}`}
      />
      <span>{item.label}</span>
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-neutral-100">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <HugeiconsIcon icon={StethoscopeIcon} className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-neutral-900">Zocare</span>
          <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Doctor Portal</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
        {navItems.map((item) => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 py-4 border-t border-neutral-100 space-y-0.5">
        {bottomNavItems.map((item) => <NavLink key={item.href} item={item} />)}
        <button
          onClick={() => router.push("/doctor/signin")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 transition-all duration-150 w-full mt-1"
        >
          <HugeiconsIcon icon={LogoutSquare01Icon} className="w-4.5 h-4.5 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-neutral-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <HugeiconsIcon icon={StethoscopeIcon} className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-neutral-900">Zocare</span>
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
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 animate-drawer-in flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={StethoscopeIcon} className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-neutral-900">Zocare</span>
              </div>
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
