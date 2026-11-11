import { Landmark } from "lucide-react";

import { FundingWorkspace } from "@/components/dashboard/funding/funding-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { listFundingOpportunities } from "@/lib/funding/queries";

export const instant = false;

export default async function BandiPage() {
  await requireUser("projects:read");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Collega Supabase"
          description="I bandi saranno disponibili dopo la configurazione del database."
        />
      </div>
    );
  }

  try {
    const items = await listFundingOpportunities();
    return (
      <div className="space-y-6">
        <Header />
        <FundingWorkspace items={items} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore di caricamento";
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Schema bandi da aggiornare"
          description={`Esegui APPLY_NOW_funding_phase_d.sql su Supabase. Dettaglio: ${message}`}
        />
      </div>
    );
  }
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent">
        <Landmark className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Bandi · Fase D
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Bandi e finanziamenti
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Opportunità da fonti ufficiali, checklist documenti, scadenze e attività
        collegate. Nessuno scraping automatico.
      </p>
    </div>
  );
}
