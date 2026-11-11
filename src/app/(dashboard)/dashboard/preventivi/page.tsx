import Link from "next/link";
import { ExternalLink, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { formatCents } from "@/lib/pricing/money";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function PreventiviPage() {
  const user = await requireUser("quotes:read");
  const canConfigure = hasPermission(user.role, "settings:write");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-6">
        <Header canConfigure={canConfigure} />
        <EmptyState
          title="Collega Supabase"
          description="Le richieste preventivo appariranno qui dopo la configurazione del database."
        />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("quote_requests")
    .select(
      "id, request_number, status, contact_name, contact_email, company_name, total_one_time_cents, total_recurring_monthly_cents, has_on_request_items, list_version, created_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <Header canConfigure={canConfigure} />

      {!requests || requests.length === 0 ? (
        <EmptyState
          title="Nessuna richiesta ancora"
          description="Quando un cliente invia il configuratore pubblico, la richiesta e lo snapshot prezzi compariranno qui."
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href="/servizi">Apri configuratore</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background-secondary text-foreground-muted">
              <tr>
                <th className="px-3 py-2 font-medium">N°</th>
                <th className="px-3 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Totale</th>
                <th className="px-3 py-2 font-medium">Listino</th>
                <th className="px-3 py-2 font-medium">Stato</th>
                <th className="px-3 py-2 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t border-border">
                  <td className="px-3 py-3 font-medium">
                    {request.request_number}
                  </td>
                  <td className="px-3 py-3">
                    <div>{request.company_name || request.contact_name}</div>
                    <div className="text-xs text-foreground-muted">
                      {request.contact_email}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {request.has_on_request_items &&
                    request.total_one_time_cents === 0
                      ? "Su preventivo"
                      : formatCents(request.total_one_time_cents)}
                    {request.total_recurring_monthly_cents > 0 ? (
                      <div className="text-xs text-foreground-muted">
                        + {formatCents(request.total_recurring_monthly_cents)}
                        /mese
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">v{request.list_version}</td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary">{request.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-foreground-muted">
                    {new Date(request.created_at).toLocaleDateString("it-IT")}
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

function Header({ canConfigure }: { canConfigure: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Preventivi</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Richieste dal configuratore pubblico con prezzi congelati al momento
          dell&apos;invio.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/servizi" target="_blank">
            Configuratore
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        {canConfigure ? (
          <Button asChild size="sm">
            <Link href="/dashboard/preventivi/configurazione">
              <Settings2 className="h-4 w-4" />
              Configurazione
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
