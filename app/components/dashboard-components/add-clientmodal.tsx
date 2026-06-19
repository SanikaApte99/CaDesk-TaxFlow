"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
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
import { Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  pan: string;
  phone: string;
  email: string;
  category: string;
  serviceType: string;
  assignedRole: string[];
}

const INITIAL_FORM: FormData = {
  name: "",
  pan: "",
  phone: "",
  email: "",
  category: "",
  serviceType: "",
  assignedRole: ["admin", "senior-ca"],
};

const SERVICE_TYPES: Record<string, string[]> = {
  individual: [
    "ITR · Salaried",
    "ITR · Business income",
    "ITR · Capital gains",
    "ITR · Professional",
  ],
  business: [
    "GST + ITR · Business",
    "GST compliance only",
    "ITR · Partnership firm",
    "ITR · Pvt Ltd",
    "Startup · 80IAC",
  ],
  nri: ["NRI · FEMA", "NRI · ITR only", "NRI · DTAA advisory"],
};

const ROLE_OPTIONS = [
  { value: "assistant", label: "Assistant" },
  { value: "senior-ca", label: "Senior CA" },
  { value: "admin", label: "Admin" },
];

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddClientModal({ open, onClose }: AddClientModalProps) {
  const { data: session } = useSession();
  const firmId = (session?.user as any)?.firmId;
  const createClient = useMutation(api.clients.create);

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleRole(role: string) {
    setForm((prev) => {
      const has = prev.assignedRole.includes(role);

      if (role === "admin") return prev;
      return {
        ...prev,
        assignedRole: has
          ? prev.assignedRole.filter((r) => r !== role)
          : [...prev.assignedRole, role],
      };
    });
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};

    if (!form.name.trim()) e.name = "Client name is required";

    if (!form.pan.trim()) e.pan = "PAN is required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.trim().toUpperCase()))
      e.pan = "Invalid PAN format (e.g. ABCDE1234F)";

    if (!form.category) e.category = "Select a category";

    if (!form.serviceType) e.serviceType = "Select a service type";

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";

    setErrors(e as Partial<FormData>);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    try {
      await createClient({
        firmId,
        name: form.name.trim(),
        pan: form.pan.trim().toUpperCase(),
        phone: form.phone || undefined,
        email: form.email || undefined,
        type: form.serviceType,
        category: form.category,
        assignedRole: form.assignedRole,
        createdBy: session?.user?.email ?? "admin",
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm(INITIAL_FORM);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setErrors({});
    setSuccess(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Add new client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Full name / Company name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Rahul Mehta or AK Exports Pvt Ltd"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={cn(errors.name && "border-red-400")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* PAN */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              PAN <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. ABCDE1234F"
              value={form.pan}
              onChange={(e) => setField("pan", e.target.value.toUpperCase())}
              maxLength={10}
              className={cn(
                "font-mono uppercase",
                errors.pan && "border-red-400",
              )}
            />
            {errors.pan && <p className="text-xs text-red-500">{errors.pan}</p>}
          </div>

          {/* Category + Service type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  setField("category", v);
                  setField("serviceType", "");
                }}
              >
                <SelectTrigger
                  className={cn(errors.category && "border-red-400")}
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="nri">NRI</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Service type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.serviceType}
                onValueChange={(v) => setField("serviceType", v)}
                disabled={!form.category}
              >
                <SelectTrigger
                  className={cn(errors.serviceType && "border-red-400")}
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {(SERVICE_TYPES[form.category] ?? []).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceType && (
                <p className="text-xs text-red-500">{errors.serviceType}</p>
              )}
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone</Label>
              <Input
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email</Label>
              <Input
                placeholder="client@email.com"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className={cn(errors.email && "border-red-400")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Visible to roles */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Visible to roles</Label>
            <div className="flex gap-2">
              {ROLE_OPTIONS.map((r) => {
                const checked = form.assignedRole.includes(r.value);
                const locked = r.value === "admin";
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleRole(r.value)}
                    disabled={locked}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                      checked
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-500",
                      locked && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    {r.label}
                    {locked && " (always)"}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Admin always has access. Toggle to also show to Senior CA or
              Associate CA.
            </p>
          </div>
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
            disabled={loading || success}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all",
              "flex items-center gap-2",
              success
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-700",
              (loading || success) && "opacity-80 cursor-not-allowed",
            )}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {success ? "Client added ✓" : loading ? "Adding..." : "Add client"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
