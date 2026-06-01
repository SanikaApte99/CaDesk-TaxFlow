"use client";

import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const statusConfig: Record<string, { label: string; cls: string }> = {
  filed: {
    label: "Filed",
    cls: "bg-green-100  text-green-800  border-green-200",
  },
  "in-progress": {
    label: "In progress",
    cls: "bg-amber-100  text-amber-800  border-amber-200",
  },
  notice: {
    label: "Notice",
    cls: "bg-red-100    text-red-800    border-red-200",
  },
  "docs-pending": {
    label: "Docs pending",
    cls: "bg-blue-100   text-blue-800   border-blue-200",
  },
  review: {
    label: "Under review",
    cls: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

const progressColor: Record<string, string> = {
  filed: "[&>div]:bg-green-600",
  "in-progress": "[&>div]:bg-amber-500",
  notice: "[&>div]:bg-red-500",
  "docs-pending": "[&>div]:bg-blue-500",
  review: "[&>div]:bg-purple-500",
};

export default function ClientsListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");

  const firmId = (session?.user as any)?.firmId as Id<"firms"> | undefined;

  const allClients = useQuery(api.clients.getAll, firmId ? { firmId } : "skip");

  const filtered =
    allClients?.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.pan.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return (
    <div className="space-y-5 max-w-250">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allClients?.length ?? 0} total clients
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2
          h-4 w-4 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search by name, PAN or service type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border
            border-gray-200 bg-white outline-none focus:ring-2
            focus:ring-gray-900 focus:border-transparent
            placeholder:text-muted-foreground"
        />
      </div>

      {/* List */}
      <Card className="shadow-none">
        <CardContent className="p-0">
          {allClients === undefined ? (
            // Loading skeleton
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-40" />
                    <div className="h-2.5 bg-gray-100 rounded w-28" />
                  </div>
                  <div className="w-20 h-2 bg-gray-100 rounded" />
                  <div className="w-20 h-5 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-10 h-10 rounded-full bg-gray-100
                flex items-center justify-center"
              >
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {search ? "No clients match your search" : "No clients yet"}
              </p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div
                className="grid grid-cols-[1fr_120px_100px_120px] gap-4
                px-5 py-2.5 border-b bg-gray-50 rounded-t-xl"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  Client
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  PAN
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Progress
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Status
                </span>
              </div>

              {filtered.map((client, i) => {
                const status =
                  statusConfig[client.status] ?? statusConfig["docs-pending"];
                return (
                  <div
                    key={client._id}
                    onClick={() =>
                      router.push(`/dashboard/clients/${client._id}`)
                    }
                    className={cn(
                      "grid grid-cols-[1fr_120px_100px_120px] gap-4",
                      "px-5 py-3.5 items-center cursor-pointer",
                      "hover:bg-muted/30 transition-colors",
                      i < filtered.length - 1 && "border-b",
                    )}
                  >
                    {/* Name + type */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center",
                          "text-[11px] font-semibold text-white shrink-0",
                          client.avatarColor,
                        )}
                      >
                        {client.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {client.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {client.type}
                        </div>
                      </div>
                    </div>

                    {/* PAN */}
                    <span className="text-xs font-mono text-muted-foreground">
                      {client.pan}
                    </span>

                    {/* Progress */}
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">
                        {client.progress}%
                      </div>
                      <Progress
                        value={client.progress}
                        className={cn(
                          "h-1.5",
                          progressColor[client.status] ?? "",
                        )}
                      />
                    </div>

                    {/* Status */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium w-fit",
                        status.cls,
                      )}
                    >
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
