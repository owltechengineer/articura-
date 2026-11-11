import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { KpiDashboard } from "@/components/dashboard/kpi/kpi-dashboard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { loadKpiSnapshot } from "@/lib/kpi/queries";

export const instant = false;

export default async function AnalyticsPage() {
  await requireUser("dashboard:access");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Collega Supabase"
          description="I KPI saranno disponibili dopo la configurazione del database."
        />
      </div>
    );
  }

  try {
    const snapshot = await loadKpiSnapshot();
    return (
      <div className="space-y-6">
        <Header />
        <KpiDashboard snapshot={snapshot} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore di caricamento";
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Impossibile calcolare i KPI"
          description={`Verifica che le migrazioni A–D siano applicate. Dettaglio: ${message}`}
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard">Torna all&apos;overview</Link>
            </Button>
          }
        />
      </div>
    );
  }
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent">
        <BarChart3 className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Analytics · Fase E
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        KPI e reportistica
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Commerciale, economia, marketing e obiettivi. Solo dati presenti nel
        sistema.
      </p>
    </div>
  );
}
