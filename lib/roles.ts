export type Role = "admin" | "senior-ca" | "associate-ca";

export const permissions = {
  canViewRevenue: (role: Role) => role === "admin",
  canViewAllClients: (role: Role) => role === "admin" || role === "senior-ca",
  canViewAITools: (role: Role) => true,
  canViewSettings: (role: Role) => true,
  canViewNotices: (role: Role) => true,
  canViewDeadlines: (role: Role) => true, // everyone
  canViewCalculators: (role: Role) => true, // everyone
  canViewFilings: (role: Role) => true, // everyone (own clients)
} as const;

import {
  LayoutDashboard,
  Users,
  FileText,
  Calculator,
  Settings,
  CalendarClock,
  AlertTriangle,
  Bot,
  Sparkles,
} from "lucide-react";

export function getNavLinks(role: Role) {
  const main = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      always: true,
    },
    { title: "Clients", href: "/dashboard/clients", icon: Users, always: true },

    {
      title: "Notices",
      href: "/notices",
      icon: AlertTriangle,
      always: false,
      badge: 3,
      show: permissions.canViewNotices(role),
    },

    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      always: false,
      show: permissions.canViewSettings(role),
    },
  ];

  const ai = [
    {
      title: "AI co-pilot",
      href: "/ai",
      icon: Bot,
      show: permissions.canViewAITools(role),
    },
    {
      title: "Draft reply",
      href: "/ai/draft",
      icon: Sparkles,
      show: permissions.canViewAITools(role),
    },
  ];

  return {
    main: main.filter((l) => l.always || l.show),
    ai: ai.filter((l) => l.show),
  };
}

export const roleLabel: Record<Role, string> = {
  admin: "Admin",
  "senior-ca": "Senior CA",
  "associate-ca": "Associate CA",
};

export const roleColor: Record<Role, string> = {
  admin: "bg-purple-100 text-purple-700",
  "senior-ca": "bg-blue-100   text-blue-700",
  "associate-ca": "bg-gray-100   text-gray-600",
};
