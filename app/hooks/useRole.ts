"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@/lib/roles";

export function useRole() {
  const { data: session, status } = useSession();

  const role = ((session?.user as any)?.role ?? "associate-ca") as Role;
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return {
    role,
    name,
    email,
    loading: status === "loading",
    isAdmin: role === "admin",
    isSeniorCA: role === "senior-ca",
    isAssociateCA: role === "associate-ca",
  };
}
