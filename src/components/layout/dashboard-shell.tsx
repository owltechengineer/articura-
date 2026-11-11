"use client";

import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandLogo } from "@/components/brand/logo";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    fullName: string | null;
    email: string;
    role: UserRole;
  };
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-secondary text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <BrandLogo href="/dashboard" variant="light" size="sm" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <DashboardNav role={user.role} />
        </div>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium">
            {user.fullName ?? user.email}
          </p>
          <p className="mt-0.5 text-xs capitalize text-sidebar-muted">
            {user.role}
          </p>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar text-sidebar-foreground transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <BrandLogo href="/dashboard" variant="light" size="sm" />
          <button
            type="button"
            aria-label="Chiudi menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <DashboardNav role={user.role} onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Apri menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Cerca clienti, progetti, preventivi…"
              className="pl-9"
              disabled
              aria-label="Ricerca (disponibile a breve)"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifiche" disabled>
              <Bell className="h-4 w-4" />
            </Button>
            <SignOutButton />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
