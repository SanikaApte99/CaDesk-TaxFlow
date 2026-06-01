"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  RefreshCw,
  Wifi,
  WifiOff,
  Building2,
  Receipt,
  User,
  Loader2,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EmailCategory = "it-dept" | "gst-dept" | "client" | "other";

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  isUnread: boolean;
  category: EmailCategory;
}

const categoryConfig: Record<
  EmailCategory,
  {
    label: string;
    badgeCls: string;
    icon: React.ElementType;
  }
> = {
  "it-dept": {
    label: "Income Tax",
    badgeCls: "bg-red-100   text-red-800   border-red-200",
    icon: Building2,
  },
  "gst-dept": {
    label: "GST Dept",
    badgeCls: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Receipt,
  },
  client: {
    label: "Client",
    badgeCls: "bg-blue-100  text-blue-800  border-blue-200",
    icon: User,
  },
  other: {
    label: "Other",
    badgeCls: "bg-gray-100  text-gray-600  border-gray-200",
    icon: Mail,
  },
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0)
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

function extractSenderName(from: string): string {
  const match = from.match(/^([^<]+)/);
  return match ? match[1].trim().replace(/"/g, "") : from;
}

function EmailRow({ email }: { email: Email }) {
  const config = categoryConfig[email.category];
  const Icon = config.icon;
  const senderName = extractSenderName(email.from);

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3 px-1 -mx-1 rounded-lg",
        "hover:bg-muted/30 cursor-pointer transition-colors border-b last:border-none",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          email.category === "it-dept" && "bg-red-100",
          email.category === "gst-dept" && "bg-amber-100",
          email.category === "client" && "bg-blue-100",
          email.category === "other" && "bg-gray-100",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            email.category === "it-dept" && "text-red-600",
            email.category === "gst-dept" && "text-amber-600",
            email.category === "client" && "text-blue-600",
            email.category === "other" && "text-gray-500",
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm truncate",
              email.isUnread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground",
            )}
          >
            {senderName}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatDate(email.date)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          {email.isUnread && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          )}
          <p
            className={cn(
              "text-xs truncate",
              email.isUnread
                ? "text-foreground font-medium"
                : "text-muted-foreground",
            )}
          >
            {email.subject}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted-foreground truncate flex-1">
            {email.snippet}
          </p>
          <Badge
            variant="outline"
            className={cn("text-[10px] shrink-0 font-medium", config.badgeCls)}
          >
            {config.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ConnectGmail() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Mail className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">
        Connect your work Gmail
      </p>
      <p className="text-xs text-muted-foreground mb-5 max-w-55">
        Connect once — the app will automatically show emails from clients and
        tax departments.
      </p>
      <a
        href="/api/gmails/connect"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
          bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#fff"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#fff"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#fff"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#fff"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Connect Gmail
      </a>
      <p className="text-[11px] text-muted-foreground mt-3">
        Read-only access · You can disconnect anytime
      </p>
    </div>
  );
}

function DisconnectDialog({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border shadow-lg p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Disconnect Gmail?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You can reconnect anytime with the same or a different account.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          <p className="text-xs text-amber-700">
            This will remove the stored Gmail access token from Convex. Emails
            will no longer be fetched until you reconnect.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border text-sm text-muted-foreground
              hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium
              hover:bg-red-700 transition-colors flex items-center gap-2
              disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                Disconnect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

type Filter = "all" | "it-dept" | "gst-dept" | "client";

export function InboxPanel() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const adminEmail = session?.user?.email ?? "";

  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Convex
  const tokenDoc = useQuery(
    api.gmailTokens.getToken,
    adminEmail ? { adminEmail } : "skip",
  );
  const deleteToken = useMutation(api.gmailTokens.deleteToken);
  const isConnected = !!tokenDoc;

  // Auto-fetch on connect
  useEffect(() => {
    if (isConnected) fetchEmails();
  }, [isConnected]);

  // Handle redirect back after OAuth
  useEffect(() => {
    const param = searchParams.get("gmail");
    if (param === "connected") fetchEmails();
  }, [searchParams]);

  async function fetchEmails() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gmails/emails");
      if (res.status === 404) return;
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to fetch emails");
        return;
      }
      const data = await res.json();
      setEmails(data.emails ?? []);
      setLastSync(new Date());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await deleteToken({ adminEmail });
      setEmails([]);
      setLastSync(null);
      setError("");
      setShowConfirm(false);
    } catch {
      setError("Failed to disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  }

  const filtered =
    filter === "all" ? emails : emails.filter((e) => e.category === filter);

  const unreadCount = emails.filter((e) => e.isUnread).length;

  const counts: Record<Filter, number> = {
    all: emails.length,
    "it-dept": emails.filter((e) => e.category === "it-dept").length,
    "gst-dept": emails.filter((e) => e.category === "gst-dept").length,
    client: emails.filter((e) => e.category === "client").length,
  };

  // Connected Gmail account email
  const connectedEmail = tokenDoc ? adminEmail : null;

  return (
    <>
      {/* Disconnect confirm dialog */}
      {showConfirm && (
        <DisconnectDialog
          onConfirm={handleDisconnect}
          onCancel={() => setShowConfirm(false)}
          loading={disconnecting}
        />
      )}

      <Card className="shadow-none">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Inbox</CardTitle>
              {isConnected && unreadCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-200 text-[11px]"
                >
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  {/* Connected account */}
                  {connectedEmail && (
                    <span className="text-[11px] text-muted-foreground hidden sm:inline truncate max-w-35">
                      {connectedEmail}
                    </span>
                  )}

                  {/* Last sync */}
                  {lastSync && (
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(lastSync.toISOString())}
                    </span>
                  )}

                  {/* Refresh */}
                  <button
                    onClick={fetchEmails}
                    disabled={loading}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label="Refresh emails"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground",
                        loading && "animate-spin",
                      )}
                    />
                  </button>

                  {/* Connected indicator */}
                  <div className="flex items-center gap-1 text-[11px] text-green-600">
                    <Wifi className="h-3 w-3" />
                    Connected
                  </div>

                  {/* Disconnect button */}
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium
                      px-2.5 py-1 rounded-md border border-red-200 text-red-600
                      hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-3 w-3" />
                    Disconnect
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <WifiOff className="h-3 w-3" />
                  Not connected
                </div>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          {isConnected && emails.length > 0 && (
            <div className="flex gap-1 mt-3">
              {(["all", "it-dept", "gst-dept", "client"] as Filter[]).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                      filter === f
                        ? "bg-gray-900 text-white"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {f === "all" && "All"}
                    {f === "it-dept" && "Income Tax"}
                    {f === "gst-dept" && "GST"}
                    {f === "client" && "Clients"}
                    {counts[f] > 0 && (
                      <span className="ml-1 opacity-60">({counts[f]})</span>
                    )}
                  </button>
                ),
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="px-5 pb-4">
          {tokenDoc === undefined ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !isConnected ? (
            <ConnectGmail />
          ) : loading && emails.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-6 text-center gap-2">
              <p className="text-sm text-red-600">{error}</p>
              {error.includes("reconnect") && (
                <a
                  href="/api/gmails/connect"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Reconnect Gmail →
                </a>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No {filter !== "all" ? filter.replace("-", " ") + " " : ""}emails
              found.
            </p>
          ) : (
            <div>
              {filtered.map((email) => (
                <EmailRow key={email.id} email={email} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
