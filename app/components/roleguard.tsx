import type { Role } from "@/lib/roles";

interface RoleGuardProps {
  role: Role;
  allowed: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  role,
  allowed,
  fallback = null,
  children,
}: RoleGuardProps) {
  if (!allowed.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
