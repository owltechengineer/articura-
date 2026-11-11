import Link from "next/link";
import { Building2 } from "lucide-react";

import {
  formatDateTimeIT,
  qualificationLabel,
} from "@/components/dashboard/crm/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { listProspects } from "@/lib/crm/queries";
import type { ProspectRecord } from "@/lib/crm/types";

export const instant = false;

export default async function ClientiPage() {
  await requireUser("clients:read");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Collega Supabase"
          description="Le anagrafiche clienti appariranno dopo la configurazione del database."
        />
      </div>
    );
  }

  let clients: ProspectRecord[] = [];
  let loadError: string | null = null;
  try {
    const all = await listProspects({ includeClients: true });
    clients = all.filter((o) => o.status !== "prospect");
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Impossibile caricare i clienti.";
  }

  return (
    <div className="space-y-6">
      <Header />
      {loadError ? (
        <EmptyState
          title="Schema da aggiornare"
          description={`Esegui APPLY_NOW_crm_phase_a.sql su Supabase. ${loadError}`}
        />
      ) : clients.length === 0 ? (
        <EmptyState
          title="Nessun cliente ancora"
          description="I prospect convertiti restano sulla stessa anagrafica e compaiono qui."
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard/crm">Apri CRM prospect</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background-secondary text-foreground-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Azienda</th>
                <th className="px-3 py-2 font-medium">Contatti</th>
                <th className="px-3 py-2 font-medium">Stato commerciale</th>
                <th className="px-3 py-2 font-medium">Aggiornato</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-3">
                    <Link
                      href={`/dashboard/crm/${c.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {c.legalName}
                    </Link>
                    <div className="text-xs text-foreground-muted">
                      {c.status === "active_client"
                        ? "Cliente attivo"
                        : "Ex cliente"}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div>{c.email || "—"}</div>
                    <div className="text-foreground-muted">{c.phone || "—"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="outline">
                      {qualificationLabel(c.qualificationStatus)}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-foreground-muted">
                    {formatDateTimeIT(c.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent">
        <Building2 className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Anagrafiche
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Clienti</h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Stessa tabella organizations del CRM: un prospect diventa cliente senza
        duplicare l&apos;anagrafica.
      </p>
    </div>
  );
}
