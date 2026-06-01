"use client";

import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  FileText,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const categoryLabel: Record<string, string> = {
  individual: "Individual",
  business: "Business",
  nri: "NRI",
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-none">
      <div
        className="w-7 h-7 rounded-md bg-gray-100 flex items-center
        justify-center shrink-0 mt-0.5"
      >
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground">
          {value || (
            <span className="text-muted-foreground font-normal">
              Not provided
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

const DEFAULT_DOCS = [
  { id: "form16", name: "Form 16", tag: "From employer", done: false },
  { id: "ais", name: "AIS / 26AS", tag: "IT portal", done: false },
  { id: "bankst", name: "Bank statements", tag: "All accounts", done: false },
  {
    id: "interest",
    name: "Interest certificates",
    tag: "FD / savings",
    done: false,
  },
  { id: "invest", name: "Investment proofs", tag: "80C / 80D", done: false },
  { id: "pan", name: "PAN card copy", tag: "Identity", done: false },
];

function DocChecklist() {
  return (
    <div className="space-y-0">
      {DEFAULT_DOCS.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 py-2.5 border-b last:border-none"
        >
          <div
            className={cn(
              "w-4 h-4 rounded border-[1.5px] shrink-0 flex items-center justify-center",
              doc.done ? "bg-green-500 border-green-500" : "border-gray-300",
            )}
          >
            {doc.done && (
              <svg
                className="h-2.5 w-2.5 text-white"
                viewBox="0 0 10 8"
                fill="none"
              >
                <path
                  d="M1 4l2.5 2.5L9 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-foreground">{doc.name}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{doc.tag}</span>
          <Badge
            variant="outline"
            className="text-[10px] bg-gray-100 text-gray-500 border-gray-200"
          >
            Pending
          </Badge>
        </div>
      ))}
    </div>
  );
}

interface ClientDetailPageProps {
  clientId: string;
}

export default function ClientDetailPage({ clientId }: ClientDetailPageProps) {
  const router = useRouter();

  const client = useQuery(api.clients.getById, {
    id: clientId as Id<"clients">,
  });

  if (client === undefined) {
    return (
      <div className="space-y-5 max-w-225 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (client === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-muted-foreground">Client not found</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const status = statusConfig[client.status] ?? statusConfig["docs-pending"];

  return (
    <div className="space-y-5 max-w-225">
      {/* Back button + header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground
            hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to clients
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                "text-lg font-semibold text-white shrink-0",
                client.avatarColor,
              )}
            >
              {client.initials}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {client.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {client.type}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {client.pan}
                </span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant="outline"
            className={cn("text-xs font-medium shrink-0 mt-1", status.cls)}
          >
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Filing progress */}
      <Card className="shadow-none">
        <CardContent className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Filing progress</span>
            <span className="text-sm font-semibold">{client.progress}%</span>
          </div>
          <Progress
            value={client.progress}
            className={cn("h-2", progressColor[client.status] ?? "")}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {client.progress === 0 && "Not started — documents pending"}
            {client.progress > 0 && client.progress < 100 && "In progress"}
            {client.progress === 100 && "Filing complete"}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Client details */}
        <Card className="shadow-none">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-medium">
              Client details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <InfoRow icon={User} label="Full name" value={client.name} />
            <InfoRow icon={Hash} label="PAN" value={client.pan} />
            <InfoRow
              icon={Building2}
              label="Category"
              value={categoryLabel[client.category] ?? client.category}
            />
            <InfoRow icon={FileText} label="Service" value={client.type} />
            <InfoRow icon={Mail} label="Email" value={client.email} />
            <InfoRow icon={Phone} label="Phone" value={client.phone} />
            <InfoRow
              icon={Calendar}
              label="Added on"
              value={new Date(client._creationTime).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            />
          </CardContent>
        </Card>

        {/* Document checklist */}
        <Card className="shadow-none">
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Document checklist
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                0 / {DEFAULT_DOCS.length} collected
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <DocChecklist />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
