"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@/lib/roles";

export function useRole() {
  const { data: session, status } = useSession();

  const role = ((session?.user as any)?.role ?? "assistant") as Role;
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return {
    role,
    name,
    email,
    loading: status === "loading",
    isAdmin: role === "admin",
    isSeniorCA: role === "senior-ca",
    isAssistant: role === "assistant",
  };
}
