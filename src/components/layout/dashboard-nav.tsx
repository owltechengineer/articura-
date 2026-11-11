"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Calendar,
  CheckSquare,
  FileText,
  Files,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { DASHBOARD_NAV } from "@/lib/constants";
import type { UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Target,
  Building2,
  FolderKanban,
  FileText,
  CheckSquare,
  Calendar,
  Wallet,
  Files,
  BarChart3,
  Settings,
};

type DashboardNavProps = {
  role: UserRole;
  onNavigate?: () => void;
};

export function DashboardNav({ role, onNavigate }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {DASHBOARD_NAV.filter(
        (item) => !("adminOnly" in item && item.adminOnly) || role === "admin",
      ).map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-muted hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
