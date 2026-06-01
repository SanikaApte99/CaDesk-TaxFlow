"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Building2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  firmName: string;
  gstin: string;
  city: string;
  phone: string;
  adminName: string;
  adminEmail: string;
  password: string;
  confirmPwd: string;
}

const INITIAL: FormData = {
  firmName: "",
  gstin: "",
  city: "",
  phone: "",
  adminName: "",
  adminEmail: "",
  password: "",
  confirmPwd: "",
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2.5 text-sm rounded-lg border bg-white",
        "placeholder:text-gray-400 text-gray-900",
        "outline-none transition-colors",
        "focus:ring-2 focus:ring-offset-0 focus:border-transparent",
        error
          ? "border-red-300 focus:ring-red-400"
          : "border-gray-200 hover:border-gray-300 focus:ring-gray-900",
        className,
      )}
      {...props}
    />
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  function set(key: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
    setApiError("");
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};

    if (!form.firmName.trim()) e.firmName = "Firm name is required";

    if (!form.adminName.trim()) e.adminName = "Your name is required";

    if (!form.adminEmail.trim()) e.adminEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail))
      e.adminEmail = "Enter a valid email address";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";

    if (!form.confirmPwd) e.confirmPwd = "Please confirm your password";
    else if (form.password !== form.confirmPwd)
      e.confirmPwd = "Passwords do not match";

    if (
      form.gstin &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gstin,
      )
    )
      e.gstin = "Invalid GSTIN format";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmName: form.firmName.trim(),
          gstin: form.gstin.trim() || undefined,
          city: form.city.trim() || undefined,
          phone: form.phone.trim() || undefined,
          adminName: form.adminName.trim(),
          adminEmail: form.adminEmail.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16
            rounded-full bg-green-100 mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Firm registered successfully!
          </h2>
          <p className="text-sm text-muted-foreground mb-1">
            Redirecting you to the login page...
          </p>
          <div className="flex justify-center mt-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-12 h-12
            rounded-xl bg-gray-900 mb-3"
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Register your firm
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up CaDesk for your CA practice
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase
                text-gray-400 mb-3"
              >
                Firm details
              </p>
              <div className="space-y-3">
                <Field label="Firm name" required error={errors.firmName}>
                  <Input
                    placeholder="e.g. Meridian Advisory"
                    value={form.firmName}
                    onChange={(e) => set("firmName", e.target.value)}
                    error={!!errors.firmName}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="GSTIN" error={errors.gstin}>
                    <Input
                      placeholder="27ABCDE1234F1Z5"
                      value={form.gstin}
                      onChange={(e) =>
                        set("gstin", e.target.value.toUpperCase())
                      }
                      error={!!errors.gstin}
                      maxLength={15}
                      className="font-mono uppercase"
                    />
                  </Field>
                  <Field label="City">
                    <Input
                      placeholder="e.g. Pune"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Firm phone">
                  <Input
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    type="tel"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase
                text-gray-400 mb-3"
              >
                Admin account
              </p>
              <div className="space-y-3">
                <Field label="Your full name" required error={errors.adminName}>
                  <Input
                    placeholder="e.g. Priya Mehta"
                    value={form.adminName}
                    onChange={(e) => set("adminName", e.target.value)}
                    error={!!errors.adminName}
                  />
                </Field>

                <Field label="Work email" required error={errors.adminEmail}>
                  <Input
                    type="email"
                    placeholder="priya@meridian.in"
                    value={form.adminEmail}
                    onChange={(e) => set("adminEmail", e.target.value)}
                    error={!!errors.adminEmail}
                    autoComplete="email"
                  />
                </Field>

                <Field label="Password" required error={errors.password}>
                  <div className="relative">
                    <Input
                      type={showPwd ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      error={!!errors.password}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-gray-600"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <Field
                  label="Confirm password"
                  required
                  error={errors.confirmPwd}
                >
                  <div className="relative">
                    <Input
                      type={showCfm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirmPwd}
                      onChange={(e) => set("confirmPwd", e.target.value)}
                      error={!!errors.confirmPwd}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCfm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-gray-600"
                      aria-label={showCfm ? "Hide password" : "Show password"}
                    >
                      {showCfm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* API error */}
            {apiError && (
              <div
                className="flex items-start gap-2 text-xs text-red-600
                bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
              >
                <span className="mt-0.5 shrink-0">⚠</span>
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                "bg-gray-900 text-white hover:bg-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create firm account"
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-gray-900 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
