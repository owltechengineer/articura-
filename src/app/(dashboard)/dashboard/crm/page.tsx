import { Target } from "lucide-react";

import { CrmWorkspace } from "@/components/dashboard/crm/crm-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { listProspects } from "@/lib/crm/queries";
import type { ProspectRecord } from "@/lib/crm/types";

export const instant = false;

export default async function CrmPage() {
  await requireUser("crm:read");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Collega Supabase"
          description="Il CRM prospect sarà disponibile dopo la configurazione del database."
        />
      </div>
    );
  }

  let prospects: ProspectRecord[] = [];
  let loadError: string | null = null;
  try {
    prospects = await listProspects({ includeClients: false });
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Impossibile caricare i prospect.";
  }

  return (
    <div className="space-y-6">
      <Header />
      {loadError ? (
        <EmptyState
          title="Schema CRM da aggiornare"
          description={`Esegui APPLY_NOW_crm_phase_a.sql su Supabase, poi ricarica. Dettaglio: ${loadError}`}
        />
      ) : (
        <CrmWorkspace prospects={prospects} />
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent">
        <Target className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          CRM · Fase A
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Prospect</h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Pipeline commerciale su anagrafiche uniche. Import/export CSV e Excel,
        controllo duplicati con revisione manuale, nessuna email promozionale
        automatica.
      </p>
    </div>
  );
}
