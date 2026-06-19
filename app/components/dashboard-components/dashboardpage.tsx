"use client";

import { AlertCircle, Lock } from "lucide-react";
import { MetricCard } from "./metric-card";
import { ClientTable } from "./client-table";
import { DeadlineList } from "./deadlinelist";
import { NoticeList } from "./notice-list";
import { InboxPanel } from "./inbox-panel";
import { cn } from "@/lib/utils";
import { useRole } from "@/app/hooks/useRole";
import { RoleGuard } from "../roleguard";
import { useSession } from "next-auth/react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function LockedMetric({ title }: { title: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-5",
        "flex flex-col justify-between min-h-24",
      )}
    >
      <p className="text-xs text-zinc-400">{title}</p>
      <div className="flex items-center gap-1.5 mt-3">
        <Lock className="h-3.5 w-3.5 text-zinc-300" />
        <span className="text-xs text-zinc-400">Admin only</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role, name, loading } = useRole();
  const { data: session } = useSession();
  const firmId = (session?.user as any)?.firmId as Id<"firms"> | undefined;
  const firm = useQuery(api.auth.getFirmById, firmId ? { firmId } : "skip");

  if (loading || !firmId) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Welcome back, {name.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            FY 2025–26 · {firm?.firmName ?? "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="h-3.5 w-3.5" />Deadline tracking coming soon
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total clients"
          value={role === "assistant" ? "12" : "128"}
          trend="up"
          trendLabel={
            role === "assistant" ? "Assigned to you" : "+12 this month"
          }
        />
        <MetricCard
          title="Pending filings"
          value={role === "assistant" ? "4" : "23"}
          trend="warn"
          trendLabel={role === "assistant" ? "2 urgent" : "5 urgent"}
        />
        <MetricCard
          title="Completed returns"
          value={role === "assistant" ? "8" : "89"}
          trend="up"
          trendLabel="+18% vs last month"
        />
        <RoleGuard
          role={role}
          allowed={["admin"]}
          fallback={<LockedMetric title="Revenue this month" />}
        >
          <MetricCard
            title="Revenue this month"
            value="₹4.2L"
            trend="up"
            trendLabel="+8% vs April"
          />
        </RoleGuard>
      </div>

      {/* Associate notice */}
      {role === "assistant" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            You are viewing only your assigned clients. Contact a Senior CA or
            Admin to access the full portfolio.
          </span>
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <ClientTable role={role} />

        <div className="space-y-4">
          <DeadlineList />

          <RoleGuard
            role={role}
            allowed={["admin", "senior-ca", "assistant"]}
            fallback={
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center">
                <Lock className="h-4 w-4 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">
                  IT notices visible to Senior CA and Admin only
                </p>
              </div>
            }
          >
            <NoticeList firmId={firmId} />
          </RoleGuard>
        </div>
      </div>

      <RoleGuard role={role} allowed={["admin"]}>
        <InboxPanel />
      </RoleGuard>
    </div>
  );
}
