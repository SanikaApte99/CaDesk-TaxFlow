"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

import { getNavLinks, roleLabel, roleColor } from "@/lib/roles";
import { useRole } from "@/app/hooks/useRole";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role, name, loading } = useRole();
  const { data: session } = useSession();
  const { main } = getNavLinks(role);

  const firmId = (session?.user as any)?.firmId as Id<"firms"> | undefined;
  const firm = useQuery(api.auth.getFirmById, firmId ? { firmId } : "skip");
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside
      className="flex w-56 flex-col shrink-0
      border-r bg-background min-h-screen"
    >
      {/* Logo */}
      <div className="flex flex-col justify-center px-5 py-4 border-b h-14">
        <span className="text-base font-semibold tracking-tight">CaDesk</span>
        <span className="text-[10px] tracking-[2px] uppercase text-muted-foreground mt-0.5">
          {firm?.firmName ?? "Loading..."}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <p
          className="text-[10px] font-medium tracking-[2px] uppercase
          text-muted-foreground px-3 pt-1 pb-2"
        >
          Practice
        </p>

        {main.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose} 
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{link.title}</span>
              {"badge" in link && link.badge && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5
                  rounded-full bg-red-100 text-red-700 leading-none"
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user info + sign out */}
      <div className="border-t px-3 py-3 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <div
            className="w-7 h-7 rounded-full bg-blue-100 text-blue-700
            flex items-center justify-center text-[11px] font-semibold shrink-0"
          >
            {loading ? "…" : initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-foreground truncate">
              {loading ? "Loading..." : name}
            </div>
            {!loading && (
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  roleColor[role],
                )}
              >
                {roleLabel[role]}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 w-full
            text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600
            transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
