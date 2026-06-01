"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileSpreadsheet, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/roles";
import { AddClientModal } from "./add-clientmodal";
import { useSession } from "next-auth/react";
import { ExcelImportModal } from "./excelimportmodal";
import { useRouter } from "next/navigation";

type Status = "filed" | "in-progress" | "notice" | "docs-pending" | "review";

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

const rowBg = [
  "bg-blue-50/70   hover:bg-blue-100/60",
  "bg-violet-50/70 hover:bg-violet-100/60",
  "bg-amber-50/70  hover:bg-amber-100/60",
  "bg-emerald-50/70 hover:bg-emerald-100/60",
  "bg-rose-50/70   hover:bg-rose-100/60",
  "bg-sky-50/70    hover:bg-sky-100/60",
];

function EmptyState({
  isAdmin,
  onAdd,
}: {
  isAdmin: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Users className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">No clients yet</p>
      {isAdmin ? (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            Add your first client to get started
          </p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
              bg-gray-900 text-white text-xs font-medium hover:bg-gray-700
              transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add first client
          </button>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          No clients have been assigned to you yet. Contact your admin.
        </p>
      )}
    </div>
  );
}

interface ClientTableProps {
  role: Role;
}

export function ClientTable({ role }: ClientTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isAdmin = role === "admin";
  const [importOpen, setImportOpen] = useState(false);
  const { data: session } = useSession();
  const firmId = (session?.user as any)?.firmId;
  const router = useRouter();
  const allClients = useQuery(api.clients.getAll, firmId ? { firmId } : "skip");

  const clients =
    allClients?.filter((c) => c.assignedRole.includes(role)) ?? [];

  if (allClients === undefined) {
    return (
      <Card className="shadow-none">
        <CardContent className="p-5">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="h-2.5 bg-gray-100 rounded w-24" />
                </div>
                <div className="w-16 h-2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Client portfolio
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({clients.length}{" "}
                {role === "associate-ca" ? "assigned" : "total"})
              </span>
            </CardTitle>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setImportOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      border border-gray-200 text-gray-700 text-xs font-medium
                      hover:bg-gray-50 transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Import Excel
                  </button>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      bg-gray-900 text-white text-xs font-medium hover:bg-gray-700
                      transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add client
                  </button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-4">
          {clients.length === 0 ? (
            <EmptyState isAdmin={isAdmin} onAdd={() => setModalOpen(true)} />
          ) : (
            <div className="space-y-1.5">
              {clients.map((client: (typeof clients)[number], i: number) => {
                const status =
                  statusConfig[client.status] ?? statusConfig["docs-pending"];
                return (
                  <div
                    key={client._id}
                    className={cn(
                      "flex items-center gap-3 py-3 px-3 rounded-lg transition-colors cursor-pointer",
                      rowBg[i % rowBg.length],
                    )}
                    onClick={() =>
                      router.push(`/dashboard/clients/${client._id}`)
                    }
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        "text-[11px] font-semibold text-white shrink-0",
                        client.avatarColor,
                      )}
                    >
                      {client.initials}
                    </div>

                    {/* Name + type */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground truncate">
                        {client.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {client.type}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="w-20 shrink-0">
                      <div className="text-[10px] text-muted-foreground text-right mb-1">
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

                    {/* Status badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium shrink-0",
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

      <AddClientModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ExcelImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </>
  );
}
