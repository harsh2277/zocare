"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchDropdown, ComboboxDropdown } from "@/components/ui/custom-dropdown";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { Tooltip } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Stepper } from "@/components/ui/stepper";
import {
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  AlertCircleIcon,
  AiBrain01Icon,
  Calendar01Icon,
  Shield01Icon,
  Medicine01Icon,
  ActivityIcon,
  Add01Icon,
  ArrowRight01Icon,
  Search01Icon,
  CallIcon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";

export default function Home() {
  const [toggleVal, setToggleVal] = useState(false);
  const [checkboxVal, setCheckboxVal] = useState(false);
  const [radioVal, setRadioVal] = useState("option1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab-profile");
  
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "warning" | "error" }[]>([]);

  const addToast = (message: string, type: "success" | "info" | "warning" | "error") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const colorShowcase = [
    {
      name: "Primary (Healthcare)",
      desc: "Used for brand presence, primary actions, active navigation states, and medical branding.",
      previewClass: "bg-primary-500",
      bgClass: "bg-primary-50",
      textClass: "text-primary-700",
      borderClass: "border-primary-200",
      hoverBorder: "hover:border-primary-400",
      icon: Medicine01Icon,
      badgeText: "Medical Teal"
    },
    {
      name: "Neutral",
      desc: "Used for background canvas, structural panel dividers, text hierarchies, and default borders.",
      previewClass: "bg-neutral-900",
      bgClass: "bg-neutral-50",
      textClass: "text-neutral-900",
      borderClass: "border-neutral-200",
      hoverBorder: "hover:border-neutral-400",
      icon: Shield01Icon,
      badgeText: "Slate / Charcoal"
    },
    {
      name: "Success",
      desc: "Used for verified indicators, completed tasks, positive health records, and confirmed appointments.",
      previewClass: "bg-success-500",
      bgClass: "bg-success-50",
      textClass: "text-success-600",
      borderClass: "border-success-200",
      hoverBorder: "hover:border-success-400",
      icon: CheckmarkCircle01Icon,
      badgeText: "Confirmed"
    },
    {
      name: "Info",
      desc: "Used for helpful notifications, system updates, AI diagnostic feedback, and health statistics.",
      previewClass: "bg-info-500",
      bgClass: "bg-info-50",
      textClass: "text-info-600",
      borderClass: "border-info-200",
      hoverBorder: "hover:border-info-400",
      icon: InformationCircleIcon,
      badgeText: "Notification"
    },
    {
      name: "Warning",
      desc: "Used for pending medication alerts, upcoming consultation checkins, and mild vitals variance.",
      previewClass: "bg-warning-500",
      bgClass: "bg-warning-50",
      textClass: "text-warning-600",
      borderClass: "border-warning-200",
      hoverBorder: "hover:border-warning-400",
      icon: AlertCircleIcon,
      badgeText: "Pending Action"
    },
    {
      name: "Error",
      desc: "Used for missed appointments, critical vital flags, network disconnections, or failed bookings.",
      previewClass: "bg-error-500",
      bgClass: "bg-error-50",
      textClass: "text-error-600",
      borderClass: "border-error-200",
      hoverBorder: "hover:border-error-400",
      icon: AlertCircleIcon,
      badgeText: "Attention Required"
    }
  ];

  const paletteShades = [
    {
      name: "Primary (Teal)",
      key: "primary",
      shades: [
        { shade: "50", bg: "bg-primary-50" },
        { shade: "100", bg: "bg-primary-100" },
        { shade: "200", bg: "bg-primary-200" },
        { shade: "300", bg: "bg-primary-300" },
        { shade: "400", bg: "bg-primary-400" },
        { shade: "500", bg: "bg-primary-500" },
        { shade: "600", bg: "bg-primary-600" },
        { shade: "700", bg: "bg-primary-700" },
        { shade: "800", bg: "bg-primary-800" },
        { shade: "900", bg: "bg-primary-900" },
        { shade: "950", bg: "bg-primary-950" }
      ]
    },
    {
      name: "Neutral (Slate)",
      key: "neutral",
      shades: [
        { shade: "50", bg: "bg-neutral-50" },
        { shade: "100", bg: "bg-neutral-100" },
        { shade: "200", bg: "bg-neutral-200" },
        { shade: "300", bg: "bg-neutral-300" },
        { shade: "400", bg: "bg-neutral-400" },
        { shade: "500", bg: "bg-neutral-500" },
        { shade: "600", bg: "bg-neutral-600" },
        { shade: "700", bg: "bg-neutral-700" },
        { shade: "800", bg: "bg-neutral-800" },
        { shade: "900", bg: "bg-neutral-900" },
        { shade: "950", bg: "bg-neutral-950" }
      ]
    },
    {
      name: "Success (Green)",
      key: "success",
      shades: [
        { shade: "50", bg: "bg-success-50" },
        { shade: "100", bg: "bg-success-100" },
        { shade: "200", bg: "bg-success-200" },
        { shade: "300", bg: "bg-success-300" },
        { shade: "400", bg: "bg-success-400" },
        { shade: "500", bg: "bg-success-500" },
        { shade: "600", bg: "bg-success-600" },
        { shade: "700", bg: "bg-success-700" },
        { shade: "800", bg: "bg-success-800" },
        { shade: "900", bg: "bg-success-900" },
        { shade: "950", bg: "bg-success-950" }
      ]
    },
    {
      name: "Info (Blue)",
      key: "info",
      shades: [
        { shade: "50", bg: "bg-info-50" },
        { shade: "100", bg: "bg-info-100" },
        { shade: "200", bg: "bg-info-200" },
        { shade: "300", bg: "bg-info-300" },
        { shade: "400", bg: "bg-info-400" },
        { shade: "500", bg: "bg-info-500" },
        { shade: "600", bg: "bg-info-600" },
        { shade: "700", bg: "bg-info-700" },
        { shade: "800", bg: "bg-info-800" },
        { shade: "900", bg: "bg-info-900" },
        { shade: "950", bg: "bg-info-950" }
      ]
    },
    {
      name: "Warning (Amber)",
      key: "warning",
      shades: [
        { shade: "50", bg: "bg-warning-50" },
        { shade: "100", bg: "bg-warning-100" },
        { shade: "200", bg: "bg-warning-200" },
        { shade: "300", bg: "bg-warning-300" },
        { shade: "400", bg: "bg-warning-400" },
        { shade: "500", bg: "bg-warning-500" },
        { shade: "600", bg: "bg-warning-600" },
        { shade: "700", bg: "bg-warning-700" },
        { shade: "800", bg: "bg-warning-800" },
        { shade: "900", bg: "bg-warning-900" },
        { shade: "950", bg: "bg-warning-950" }
      ]
    },
    {
      name: "Error (Red)",
      key: "error",
      shades: [
        { shade: "50", bg: "bg-error-50" },
        { shade: "100", bg: "bg-error-100" },
        { shade: "200", bg: "bg-error-200" },
        { shade: "300", bg: "bg-error-300" },
        { shade: "400", bg: "bg-error-400" },
        { shade: "500", bg: "bg-error-500" },
        { shade: "600", bg: "bg-error-600" },
        { shade: "700", bg: "bg-error-700" },
        { shade: "800", bg: "bg-error-800" },
        { shade: "900", bg: "bg-error-900" },
        { shade: "950", bg: "bg-error-950" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 flex flex-col justify-between selection:bg-primary-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[4px] bg-primary-600 flex items-center justify-center border border-primary-700/10">
            <span className="text-white font-extrabold text-lg">z</span>
          </div>
          <span className="text-xl font-black text-primary-700 tracking-tight">zocare</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" leftIcon={Calendar01Icon}>
            Bookings
          </Button>
          <Button variant="primary" size="md" leftIcon={AiBrain01Icon}>
            Zocare AI
          </Button>
        </div>
      </header>

      {/* Main Showcase */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16 flex-1">
        {/* Title Block */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-[4px] bg-primary-50 text-primary-700 text-xs font-bold tracking-wide uppercase border border-primary-200">
            Brand Palette & Theme System
          </span>
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-neutral-900">
            One Destination for All Your <span className="text-primary-600">Health Needs</span>
          </h1>
          <p className="text-lg lg:text-xl text-neutral-500 leading-relaxed">
            A premium Healthcare Design System designed for maximum accessibility, visual harmony, and readability.
          </p>
        </section>

        {/* Color Palette Matrix */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorShowcase.map((color) => {
            const IconComponent = color.icon;
            return (
              <div
                key={color.name}
                className={`bg-white rounded-2xl border ${color.borderClass} ${color.hoverBorder} p-6 transition-all duration-300 flex flex-col justify-between group`}
              >
                <div className="space-y-4">
                  {/* Card Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-[4px] ${color.bgClass} ${color.textClass}`}>
                      <HugeiconsIcon icon={IconComponent} className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-[4px] ${color.bgClass} ${color.textClass}`}>
                      {color.badgeText}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">
                      {color.name}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {color.desc}
                    </p>
                  </div>
                </div>

                {/* Color Swatch / Preview */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                    <span>Palette Swatch</span>
                    <span className="uppercase">{color.name.split(" ")[0]}</span>
                  </div>
                  <div className="h-8 w-full rounded-[4px] overflow-hidden flex border border-neutral-200/50">
                    <div className={`flex-1 ${color.previewClass}`}></div>
                    <div className={`w-1/3 opacity-80 ${color.previewClass}`}></div>
                    <div className={`w-1/6 opacity-60 ${color.previewClass}`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Color Shade Spectrum Cards */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-8">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl text-neutral-900">Color Shade Spectrums</h3>
            <p className="text-sm text-neutral-500">Every color palette has 11 distinct weight steps (50 to 950) mapped inside Tailwind CSS.</p>
          </div>
          <div className="space-y-6">
            {paletteShades.map((palette) => (
              <div key={palette.key} className="space-y-3">
                <h4 className="font-bold text-sm text-neutral-600">{palette.name}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-11 gap-2">
                  {palette.shades.map((shadeObj) => {
                    const isDarkText = parseInt(shadeObj.shade) >= 500;
                    return (
                      <div
                        key={shadeObj.shade}
                        className={`${shadeObj.bg} h-16 rounded-[4px] border border-neutral-200/20 flex flex-col justify-between p-2 group relative`}
                      >
                        <span className={`text-[10px] font-extrabold ${isDarkText ? "text-white" : "text-neutral-800"}`}>
                          {shadeObj.shade}
                        </span>
                        <span className={`text-[8px] font-medium tracking-tight ${isDarkText ? "text-white/80" : "text-neutral-500"}`}>
                          {shadeObj.bg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive health checker component to display active status colors live */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={ActivityIcon} className="h-6 w-6 text-primary-600" />
            <h3 className="font-extrabold text-xl text-neutral-900">System Activity Monitor</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-success-50 border border-success-200 rounded-[4px] p-4 flex items-center gap-3.5">
              <div className="p-2 bg-success-500 rounded-[4px] text-white">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-success-600 block">Health Link</span>
                <span className="font-bold text-sm text-neutral-900">Connected</span>
              </div>
            </div>

            <div className="bg-info-50 border border-info-200 rounded-[4px] p-4 flex items-center gap-3.5">
              <div className="p-2 bg-info-500 rounded-[4px] text-white">
                <HugeiconsIcon icon={InformationCircleIcon} className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-info-600 block">API Status</span>
                <span className="font-bold text-sm text-neutral-900">Synced</span>
              </div>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-[4px] p-4 flex items-center gap-3.5">
              <div className="p-2 bg-warning-500 rounded-[4px] text-white">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-warning-600 block">Prescription</span>
                <span className="font-bold text-sm text-neutral-900">1 Pending</span>
              </div>
            </div>

            <div className="bg-error-50 border border-error-200 rounded-[4px] p-4 flex items-center gap-3.5">
              <div className="p-2 bg-error-500 rounded-[4px] text-white">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-error-600 block">Alert Tracker</span>
                <span className="font-bold text-sm text-neutral-900">0 High Flags</span>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Showcase Section */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-8">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl text-neutral-900">Interactive Button System</h3>
            <p className="text-sm text-neutral-500">Comprehensive variants, sizes, and interactive states matching the branding rules.</p>
          </div>

          <div className="space-y-8 divide-y divide-neutral-200/60">
            {/* Primary Buttons */}
            <div className="pt-2 space-y-4">
              <h4 className="font-bold text-sm text-neutral-600">Primary Buttons</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">Small Button</Button>
                <Button variant="primary" size="md">Medium Button</Button>
                <Button variant="primary" size="lg">Large Button</Button>
                <Button variant="primary" size="md" leftIcon={Add01Icon}>Left Icon</Button>
                <Button variant="primary" size="md" rightIcon={ArrowRight01Icon}>Right Icon</Button>
                
                {/* Focused State mock via border active styling */}
                <Button variant="primary" size="md" className="ring-2 ring-primary-500/20">Focused State</Button>
                <Button variant="primary" size="md" disabled>Disabled State</Button>
                <Button variant="primary" size="md" loading>Loading...</Button>
              </div>
            </div>

            {/* Outline Buttons */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-neutral-600">Outline Buttons</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="outline" size="sm">Small Outline</Button>
                <Button variant="outline" size="md">Medium Outline</Button>
                <Button variant="outline" size="lg">Large Outline</Button>
                <Button variant="outline" size="md" leftIcon={Add01Icon}>Left Icon</Button>
                <Button variant="outline" size="md" rightIcon={ArrowRight01Icon}>Right Icon</Button>
                
                <Button variant="outline" size="md" className="ring-2 ring-neutral-500/10">Focused State</Button>
                <Button variant="outline" size="md" disabled>Disabled State</Button>
                <Button variant="outline" size="md" loading>Loading...</Button>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-neutral-600">Ghost Buttons</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="ghost" size="sm">Small Ghost</Button>
                <Button variant="ghost" size="md">Medium Ghost</Button>
                <Button variant="ghost" size="lg">Large Ghost</Button>
                <Button variant="ghost" size="md" className="bg-neutral-100/80">Focused State</Button>
                <Button variant="ghost" size="md" disabled>Disabled State</Button>
                <Button variant="ghost" size="md" loading>Loading...</Button>
              </div>
            </div>

            {/* Link Buttons */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-neutral-600">Link Buttons</h4>
              <div className="flex flex-wrap items-center gap-6">
                <Button variant="link" size="sm">Small Link</Button>
                <Button variant="link" size="md">Medium Link</Button>
                <Button variant="link" size="lg">Large Link</Button>
                <Button variant="link" size="md" className="text-primary-700 ring-2 ring-primary-500/20 px-1">Focused State</Button>
                <Button variant="link" size="md" disabled>Disabled Link</Button>
                <Button variant="link" size="md" loading>Loading...</Button>
              </div>
            </div>

            {/* Icon Only Buttons */}
            <div className="pt-6 space-y-4">
              <h4 className="font-bold text-sm text-neutral-600">Icon Only Buttons</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="outline" size="sm" leftIcon={Add01Icon} />
                <Button variant="outline" size="md" leftIcon={Add01Icon} />
                <Button variant="outline" size="lg" leftIcon={Add01Icon} />
                <Button variant="outline" size="md" leftIcon={Add01Icon} className="ring-2 ring-neutral-500/10" />
                <Button variant="outline" size="md" leftIcon={Add01Icon} disabled />
                <Button variant="outline" size="md" loading />
              </div>
            </div>
          </div>
        </section>

        {/* Inputs Showcase Section */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-8">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl text-neutral-900">Interactive Input System</h3>
            <p className="text-sm text-neutral-500">Comprehensive states, variants, and layouts matching the design guidelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: Basic States */}
            <div className="space-y-6">
              <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2">Basic States</h4>
              <Input
                label="Default Input"
                placeholder="Enter your full name..."
              />
              <Input
                label="With Left Icon"
                placeholder="Search medical records..."
                leftIcon={Search01Icon}
              />
              <Input
                label="Phone Number Input"
                placeholder="Enter phone number..."
                type="tel"
                leftIcon={CallIcon}
              />
              <Input
                label="Password Field (With Toggle)"
                placeholder="Enter your secure password..."
                type="password"
              />
              <Input
                label="Disabled State"
                placeholder="Cannot type here..."
                disabled
              />
            </div>

            {/* Column 2: Advanced States */}
            <div className="space-y-6">
              <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2">Validation & Selects</h4>
              <Select
                label="Dropdown Field (Select Specialist)"
                options={[
                  { value: "general", label: "General Physician" },
                  { value: "cardio", label: "Cardiologist" },
                  { value: "pedia", label: "Pediatrician" },
                  { value: "neuro", label: "Neurologist" }
                ]}
              />
              <SearchDropdown
                label="Dropdown with Search inside List"
                placeholder="Search and select city..."
                options={[
                  { value: "ny", label: "New York" },
                  { value: "la", label: "Los Angeles" },
                  { value: "sf", label: "San Francisco" },
                  { value: "ch", label: "Chicago" },
                  { value: "bo", label: "Boston" }
                ]}
              />
              <ComboboxDropdown
                label="Dropdown with Search in Main Field"
                placeholder="Search symptoms (e.g., Fever)..."
                options={[
                  { value: "fever", label: "Fever" },
                  { value: "cough", label: "Cough" },
                  { value: "headache", label: "Headache" },
                  { value: "fatigue", label: "Fatigue" },
                  { value: "nausea", label: "Nausea" }
                ]}
              />
              <Input
                label="Error State"
                placeholder="Enter email address..."
                defaultValue="invalid-email-address"
                error="Please enter a valid email address."
              />
              <Input
                label="Read-Only State"
                defaultValue="ZC-2094 (Verified Patient)"
                readOnly
              />
              <Input
                label="Textarea (Multi-line)"
                placeholder="Describe your symptoms here..."
                multiline
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Interactive UI Elements Showcase */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-8">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl text-neutral-900">Interactive UI Elements</h3>
            <p className="text-sm text-neutral-500">Selection controls, informative badges, floating popups, and notification systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: Controls & Badges */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2">Informative Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2">Selection Controls</h4>
                <div className="space-y-3">
                  {/* Toggles */}
                  <div className="flex flex-wrap items-center gap-6">
                    <Toggle checked={toggleVal} onChange={setToggleVal} label="Interactive Switch" />
                    <Toggle checked={true} onChange={() => {}} label="Disabled On Switch" disabled />
                  </div>
                  {/* Checkboxes */}
                  <div className="flex flex-wrap items-center gap-6">
                    <Checkbox checked={checkboxVal} onChange={setCheckboxVal} label="I agree to terms" />
                    <Checkbox checked={true} onChange={() => {}} label="Disabled Checkbox" disabled />
                  </div>
                  {/* Radio Buttons */}
                  <div className="flex flex-wrap items-center gap-6">
                    <Radio checked={radioVal === "option1"} onChange={() => setRadioVal("option1")} label="Daily Checkup" name="diagnostics" />
                    <Radio checked={radioVal === "option2"} onChange={() => setRadioVal("option2")} label="Weekly Report" name="diagnostics" />
                    <Radio checked={false} onChange={() => {}} label="Disabled Radio" name="disabled-radio" disabled />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Overlays & Notifications */}
            <div className="space-y-6">
              <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2">Overlays & Notifications</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                  Open Modal Popup
                </Button>
                <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                  Open Side Drawer
                </Button>
              </div>

              {/* Toast Notification Triggers */}
              <div className="space-y-3 pt-2">
                <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wide">
                  Trigger Toast Notifications
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-success-200 hover:bg-success-50 text-success-700" onClick={() => addToast("Appointment scheduled successfully!", "success")}>
                    Success Toast
                  </Button>
                  <Button variant="outline" className="border-info-200 hover:bg-info-50 text-info-750" onClick={() => addToast("New diagnostic report is available.", "info")}>
                    Info Toast
                  </Button>
                  <Button variant="outline" className="border-warning-200 hover:bg-warning-50 text-warning-700" onClick={() => addToast("Please complete your health profile.", "warning")}>
                    Warning Toast
                  </Button>
                  <Button variant="outline" className="border-error-200 hover:bg-error-50 text-error-700" onClick={() => addToast("Missed vitals check flag reported.", "error")}>
                    Error Toast
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Premium Components Section */}
        <section className="mt-8 border border-neutral-200/80 rounded-[24px] p-8 bg-white shadow-sm space-y-8">
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900 tracking-tight">Newly Added UI Components</h3>
              <p className="text-xs text-neutral-450 mt-1 font-medium">Explore our latest selection of premium design tokens & components.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Column 1: Avatars & Tooltips */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2 mb-3">Avatar Profile Badges</h4>
                  <div className="flex items-center gap-3">
                    <Avatar fallback="JD" size="sm" status="online" />
                    <Avatar fallback="AP" size="md" status="away" />
                    <Avatar fallback="MS" size="lg" status="offline" />
                    <Avatar fallback="ZC" size="xl" status="online" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150" />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2 mb-3">Interactive Tooltips</h4>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <Tooltip content="Main Brand Medical Theme Color" position="top">
                      <span className="cursor-help px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200/60 rounded-md text-xs font-semibold">Hover Top</span>
                    </Tooltip>
                    <Tooltip content="Completed Diagnostics Flag" position="bottom">
                      <span className="cursor-help px-3 py-1.5 bg-success-50 text-success-700 border border-success-200/60 rounded-md text-xs font-semibold">Hover Bottom</span>
                    </Tooltip>
                    <Tooltip content="Secure SSL Protocol Active" position="right">
                      <span className="cursor-help px-3 py-1.5 bg-neutral-50 text-neutral-700 border border-neutral-250/60 rounded-md text-xs font-semibold">Hover Right</span>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Column 2: Tabs & Progress */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2 mb-3">Interactive Tabs</h4>
                  <Tabs
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    tabs={[
                      { id: "tab-profile", label: "Patient Profile" },
                      { id: "tab-vitals", label: "Vitals Data" },
                      { id: "tab-reports", label: "Reports" }
                    ]}
                  />
                  <div className="mt-3 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-200/40">
                    Active Content: <span className="font-bold text-neutral-800">{activeTab === "tab-profile" ? "👤 Patient Profile Details" : activeTab === "tab-vitals" ? "📊 Realtime Vital Charts" : "📄 Diagnostic PDFs"}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2 mb-3">Progress Bar</h4>
                  <Progress value={68} showValue />
                </div>
              </div>

              {/* Column 3: Accordion & Stepper */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2 mb-3">Accordion FAQ</h4>
                  <Accordion
                    items={[
                      { id: "faq-1", title: "How to view reports?", content: "You can download diagnostic PDF files inside the vital history page." },
                      { id: "faq-2", title: "How to change password?", content: "Navigate to the Security options within your general account profile page." }
                    ]}
                  />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-neutral-600 border-b border-neutral-200/60 pb-2 mb-3">Interactive Stepper</h4>
                  <Stepper
                    activeStep={1}
                    steps={[
                      { label: "Booked", description: "Slot selected" },
                      { label: "Check-in", description: "Vitals verified" },
                      { label: "Consultation" }
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/60 bg-white py-8 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between text-neutral-400 text-xs">
        <span>© 2026 Zocare Inc. All rights reserved.</span>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium">
          <a href="#" className="hover:text-primary-600">Privacy Policy</a>
          <a href="#" className="hover:text-primary-600">Terms of Service</a>
          <a href="#" className="hover:text-primary-600">Help Support</a>
        </div>
      </footer>

      {/* Modal Popup Overlay */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Health Consultation">
        <p>Would you like to confirm a virtual consultation checkin with Dr. Jenkins today? You will receive a video meeting link 10 minutes prior to the scheduled slot.</p>
      </Modal>

      {/* Side Drawer Overlay */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Health Profile Settings">
        <div className="space-y-4">
          <Input label="Emergency Contact Name" defaultValue="Aria Parmar" />
          <Input label="Emergency Contact Number" defaultValue="+1 (555) 302-0948" />
          <Select
            label="Blood Group Type"
            options={[
              { value: "ap", label: "A+" },
              { value: "an", label: "A-" },
              { value: "op", label: "O+" },
              { value: "on", label: "O-" }
            ]}
          />
        </div>
      </Drawer>

      {/* Floating Toast Notification Containers */}
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm pointer-events-none" style={{ height: toasts.length > 0 ? "85px" : "0px" }}>
        <div className="relative w-full h-full">
          {toasts.map((toast, index) => {
            const reverseIndex = toasts.length - 1 - index;
            if (reverseIndex >= 3) return null; // Show max 3 stacked

            // Older toasts are offset upwards slightly and scaled down
            const translateY = -reverseIndex * 14; 
            const scale = 1 - reverseIndex * 0.04; 
            const opacity = 1 - reverseIndex * 0.15;
            const zIndex = 50 - reverseIndex;

            const typeStyles = {
              success: "border-l-4 border-l-success-500 bg-white border-neutral-200/50 text-neutral-850 shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              info: "border-l-4 border-l-info-500 bg-white border-neutral-200/50 text-neutral-850 shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              warning: "border-l-4 border-l-warning-500 bg-white border-neutral-200/50 text-neutral-850 shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              error: "border-l-4 border-l-error-500 bg-white border-neutral-200/50 text-neutral-850 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            };
            const iconStyles = {
              success: "bg-success-50 text-success-600 border border-success-100/70",
              info: "bg-info-50 text-info-600 border border-info-100/70",
              warning: "bg-warning-50 text-warning-600 border border-warning-100/70",
              error: "bg-error-50 text-error-600 border border-error-100/70"
            };
            const titleText = {
              success: "Success",
              info: "Notification",
              warning: "Warning",
              error: "Alert"
            };
            const iconObj = toast.type === "success" 
              ? CheckmarkCircle01Icon 
              : toast.type === "info"
              ? InformationCircleIcon
              : AlertCircleIcon;

            return (
              <div
                key={toast.id}
                onClick={() => dismissToast(toast.id)}
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                className={`absolute bottom-0 right-0 w-full flex items-start gap-3 p-4 rounded-xl border pointer-events-auto cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${typeStyles[toast.type]}`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center ${iconStyles[toast.type]}`}>
                  <HugeiconsIcon icon={iconObj} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] font-bold text-neutral-900 tracking-tight leading-none">{titleText[toast.type]}</p>
                  <p className="text-[12px] font-medium text-neutral-500 mt-1 leading-normal">{toast.message}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissToast(toast.id);
                  }}
                  className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0 self-start -mt-0.5"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}