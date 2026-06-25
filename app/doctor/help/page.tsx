"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Mail01Icon, HelpCircleIcon, ArrowRight01Icon, EyeIcon } from "@hugeicons/core-free-icons";

const faqs = [
  {
    id: "q1", title: "How do I add a patient to the queue?",
    content: "Go to the Queue page from the sidebar. On the right side, use the 'Add to Queue' form — search for the patient by name or ID, select the assigned doctor, add any notes, and click 'Add to Queue'. The patient will appear in the live queue with an auto-assigned token number.",
  },
  {
    id: "q2", title: "How do I write a prescription?",
    content: "Navigate to the Prescriptions page and click 'New Prescription'. Search for the patient and click Continue. On the prescription page, fill in the diagnosis, chief complaint, vitals, and add medications with dosage, frequency, and duration. Click 'Save & Print' when done.",
  },
  {
    id: "q3", title: "Can I print prescriptions directly?",
    content: "Yes! Open any prescription and click the 'Save & Print' button in the action bar. The prescription will be formatted for A4/A5 printing with your clinic details, patient information, and medications clearly laid out. You can also download it as a PDF.",
  },
  {
    id: "q4", title: "How do I manage billing and invoices?",
    content: "Go to Billing in the sidebar. Click 'Create Invoice', select a patient, and add line items (services, procedures, medicines). Set the total, apply discounts if needed, and choose a payment method. You can save as draft or issue immediately. Payments can be tracked in the invoice detail view.",
  },
  {
    id: "q5", title: "How do I export reports?",
    content: "On the Reports page, select your desired date range using the period filter at the top. Then click 'Export Report' in the top-right corner. You can export as a PDF summary or CSV for detailed analysis. The export includes revenue, patient volume, and top diagnoses.",
  },
  {
    id: "q6", title: "How do I add or remove staff members?",
    content: "Go to Staff & Users in the sidebar. Click 'Add Staff' and fill in the details including role (Doctor or Receptionist), name, email, and credentials. Check 'Send email invite' to automatically email them login credentials. To deactivate a staff member, click the edit icon on their row and toggle their status.",
  },
];

const quickLinks = [
  { icon: ArrowRight01Icon, label: "Getting Started",  desc: "Setup guide for new users", color: "bg-primary-50 text-primary-600" },
  { icon: EyeIcon,        label: "Video Tutorials",  desc: "Watch how-to videos",        color: "bg-info-50 text-info-600"    },
  { icon: HelpCircleIcon,   label: "Documentation",    desc: "Full feature reference",     color: "bg-neutral-100 text-neutral-600" },
  { icon: Mail01Icon,       label: "Contact Support",  desc: "Get help from our team",     color: "bg-success-50 text-success-600" },
];

export default function DoctorHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });

  const filteredFaqs = faqs.filter(
    (f) => !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Help & Support" subtitle="Find answers and get assistance" />

      {/* Search */}
      <div className="max-w-xl mb-8">
        <Input
          placeholder="Search for answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          leftIcon={Search01Icon}
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link) => (
          <button
            key={link.label}
            className="bg-white border border-neutral-200 rounded-xl p-4 text-left hover:border-neutral-300 hover: transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${link.color}`}>
              <HugeiconsIcon icon={link.icon} className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">{link.label}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{link.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-neutral-900 mb-4">Frequently Asked Questions</h2>
          <Accordion items={filteredFaqs} />
          {filteredFaqs.length === 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center text-sm text-neutral-400">
              No FAQs matched your search. Try different keywords or contact support.
            </div>
          )}
        </div>

        {/* Contact support */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Contact Support</CardTitle></CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <HugeiconsIcon icon={Mail01Icon} className="w-4.5 h-4.5 text-primary-600 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400">Email us</p>
                  <p className="text-sm font-medium text-neutral-800">support@zocare.health</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <HugeiconsIcon icon={HelpCircleIcon} className="w-4.5 h-4.5 text-primary-600 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400">Toll-free</p>
                  <p className="text-sm font-medium text-neutral-800">1800-123-4567</p>
                </div>
              </div>
              <Button variant="primary" className="w-full">Start Live Chat</Button>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Submit a Ticket</CardTitle></CardHeader>
            <div className="space-y-3">
              <Input
                label="Subject"
                placeholder="Briefly describe your issue"
                value={contactForm.subject}
                onChange={(e) => setContactForm((f) => ({ ...f, subject: (e.target as HTMLInputElement).value }))}
              />
              <Input
                label="Message"
                multiline
                rows={4}
                placeholder="Describe your issue in detail..."
                value={contactForm.message}
                onChange={(e) => setContactForm((f) => ({ ...f, message: (e.target as HTMLTextAreaElement).value }))}
              />
              <Button variant="primary" className="w-full" leftIcon={Mail01Icon}>
                Send Ticket
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
