"use client";
import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type ITRequest = {
  id: string;
  name: string;
  date: string;
  issue: string;
  message: string;
  status: string;
};

export default function DoctorHelpPage() {
  const [requests, setRequests] = useState<ITRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("it_support_requests")
      .select("id, requester_name, issue_type, message, status, created_at")
      .order("created_at", { ascending: false });

    setRequests(((data as any[]) ?? []).map((r) => ({
      id: r.id,
      name: r.requester_name,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—",
      issue: r.issue_type,
      message: r.message ?? "",
      status: r.status === "resolved" ? "Resolved" : "Pending",
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleResolve = async (id: string) => {
    const supabase = createClient();
    await (supabase.from("it_support_requests") as any).update({ status: "resolved" }).eq("id", id);
    loadRequests();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await (supabase.from("it_support_requests") as any).delete().eq("id", id);
    loadRequests();
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="IT Support Requests" subtitle="Manage receptionist password and access requests" />
        <Card className="p-8 text-center text-sm text-neutral-400 animate-pulse">Loading support requests...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="IT Support Requests"
        subtitle="Manage receptionist password and access requests"
      />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-[#FBFCFD] select-none">
                {["Date", "Receptionist", "Issue", "Description", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-bold text-neutral-450 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-neutral-400"
                  >
                    No support requests submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/50 text-sm">
                    <td className="px-5 py-3.5 text-neutral-500 font-mono text-xs font-medium">
                      {req.date}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-800">
                      {req.name}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#0b6e6e]">
                      {req.issue}
                    </td>
                    <td
                      className="px-5 py-3.5 text-neutral-600 max-w-[220px] truncate"
                      title={req.message}
                    >
                      {req.message || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={req.status === "Resolved" ? "success" : "warning"}
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        {req.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2.5 py-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => handleResolve(req.id)}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs px-2 py-1 text-error-600 hover:bg-error-50"
                          onClick={() => handleDelete(req.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
