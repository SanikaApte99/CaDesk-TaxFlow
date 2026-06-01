"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12
            rounded-xl bg-gray-900 mb-4"
          >
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            CaDesk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Practice management for CA firms
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter your firm credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-gray-700"
                htmlFor="email"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@yourfirm.in"
                className={cn(
                  "w-full px-3 py-2.5 text-sm rounded-lg border bg-white",
                  "placeholder:text-gray-400 text-gray-900 outline-none transition-colors",
                  "focus:ring-2 focus:ring-offset-0 focus:border-transparent",
                  error
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:ring-gray-900",
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className={cn(
                    "w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-white",
                    "placeholder:text-gray-400 text-gray-900 outline-none transition-colors",
                    "focus:ring-2 focus:ring-offset-0 focus:border-transparent",
                    error
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 hover:border-gray-300 focus:ring-gray-900",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 text-xs text-red-600
                bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
              >
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 px-4",
                "rounded-lg text-sm font-medium transition-all",
                "bg-gray-900 text-white hover:bg-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          New to CaDesk?{" "}
          <Link
            href="/register"
            className="text-gray-900 font-medium hover:underline"
          >
            Register your firm
          </Link>
        </p>
      </div>
    </div>
  );
}
