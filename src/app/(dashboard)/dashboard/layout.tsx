import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";

// Auth reads cookies — keep this layout request-time for Phase 1.
export const instant = false;

async function DashboardFrame({ children }: { children: React.ReactNode }) {
  const user = await requireUser("dashboard:access");

  return (
    <DashboardShell
      user={{
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-secondary p-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-6 h-40 w-full" />
        </div>
      }
    >
      <DashboardFrame>{children}</DashboardFrame>
    </Suspense>
  );
}
