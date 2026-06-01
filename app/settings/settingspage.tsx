"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  Mail,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  Wifi,
  WifiOff,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

const roleConfig: Record<string, { label: string; cls: string }> = {
  admin: {
    label: "Admin",
    cls: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "senior-ca": {
    label: "Senior CA",
    cls: "bg-blue-100   text-blue-700   border-blue-200",
  },
  "associate-ca": {
    label: "Associate CA",
    cls: "bg-gray-100   text-gray-600   border-gray-200",
  },
};

interface MemberForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

const MEMBER_INITIAL: MemberForm = {
  name: "",
  email: "",
  password: "",
  role: "",
};

function AddMemberModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<MemberForm>(MEMBER_INITIAL);
  const [errors, setErrors] = useState<Partial<MemberForm>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function set(key: keyof MemberForm, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
    setApiError("");
  }

  function validate() {
    const e: Partial<MemberForm> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Min. 8 characters";
    if (!form.role) e.role = "Select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/team/add-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error);
        return;
      }
      setForm(MEMBER_INITIAL);
      onSuccess();
      onClose();
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(MEMBER_INITIAL);
    setErrors({});
    setApiError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Add team member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Rohit Joshi"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={cn(errors.name && "border-red-400")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Work email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="rohit@yourfirm.in"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={cn(errors.email && "border-red-400")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger className={cn(errors.role && "border-red-400")}>
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="senior-ca">Senior CA</SelectItem>
                <SelectItem value="associate-ca">Associate CA</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Temporary password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={cn("pr-10", errors.password && "border-red-400")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-gray-400 hover:text-gray-600"
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Share this with the team member. They can change it after logging
              in.
            </p>
          </div>

          {apiError && (
            <div
              className="flex items-start gap-2 text-xs text-red-600
              bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
            >
              <span className="mt-0.5">⚠</span>
              {apiError}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border text-sm text-muted-foreground
              hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm
              font-medium hover:bg-gray-700 transition-colors flex items-center
              gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? "Adding..." : "Add member"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);

  const firmId = (session?.user as any)?.firmId as Id<"firms"> | undefined;
  const userRole = (session?.user as any)?.role as string;

  // Fetch firm details
  const firm = useQuery(api.auth.getFirmById, firmId ? { firmId } : "skip");

  // Fetch team members
  const members = useQuery(
    api.auth.getTeamMembers,
    firmId ? { firmId } : "skip",
  );

  // Fetch Gmail connection status
  const adminEmail = session?.user?.email ?? "";
  const gmailToken = useQuery(
    api.gmailTokens.getToken,
    adminEmail ? { adminEmail } : "skip",
  );

  function handleMemberAdded() {
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 3000);
  }

  return (
    <div className="space-y-5 max-w-200">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your firm details and team
        </p>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Firm details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {!firm ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-100 rounded w-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Firm name</p>
                <p className="text-sm font-medium">{firm.firmName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">GSTIN</p>
                <p className="text-sm font-medium font-mono">
                  {firm.gstin ?? (
                    <span className="text-muted-foreground font-sans font-normal">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">City</p>
                <p className="text-sm font-medium">
                  {firm.city ?? (
                    <span className="text-muted-foreground font-normal">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="text-sm font-medium">
                  {firm.phone ?? (
                    <span className="text-muted-foreground font-normal">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Registered on
                </p>
                <p className="text-sm font-medium">
                  {new Date(firm.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Team members
              {members && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({members.length})
                </span>
              )}
            </CardTitle>

            {/* Add member — admin only */}
            {userRole === "admin" && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5
                  rounded-lg bg-gray-900 text-white text-xs font-medium
                  hover:bg-gray-700 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add member
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-4">
          {/* Success message */}
          {addedMsg && (
            <div
              className="flex items-center gap-2 text-xs text-green-700
              bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Team member added successfully
            </div>
          )}

          {!members ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-2.5 bg-gray-100 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No team members yet. Add your first member above.
            </p>
          ) : (
            <div className="space-y-0">
              {members.map((member, i) => {
                const rc =
                  roleConfig[member.role] ?? roleConfig["associate-ca"];
                const initials = member.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={member._id}
                    className={cn(
                      "flex items-center gap-3 py-3",
                      i < members.length - 1 && "border-b",
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full bg-gray-900 text-white
                      flex items-center justify-center text-[11px] font-semibold
                      shrink-0"
                    >
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {member.name}
                        </span>
                        {member.email === session?.user?.email && (
                          <span className="text-[10px] text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>

                    {/* Role badge */}
                    <Badge
                      variant="outline"
                      className={cn("text-[11px] font-medium shrink-0", rc.cls)}
                    >
                      {rc.label}
                    </Badge>

                    {/* Joined date */}
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(member.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Connected accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {/* Gmail icon */}
              <div
                className="w-8 h-8 rounded-lg bg-red-50 border border-red-100
                flex items-center justify-center shrink-0"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Gmail</p>
                <p className="text-xs text-muted-foreground">
                  {gmailToken ? `Connected as ${adminEmail}` : "Not connected"}
                </p>
              </div>
            </div>

            {gmailToken ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Wifi className="h-3.5 w-3.5" />
                  Connected
                </div>
                <a
                  href="/dashboard"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Manage in dashboard →
                </a>
              </div>
            ) : (
              <a
                href="/api/gmails/connect"
                className="inline-flex items-center gap-1.5 px-3 py-1.5
                  rounded-lg border border-gray-200 text-xs font-medium
                  text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <WifiOff className="h-3.5 w-3.5" />
                Connect Gmail
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleMemberAdded}
      />
    </div>
  );
}
