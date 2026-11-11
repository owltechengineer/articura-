import Link from "next/link";
import {
  Building2,
  CheckSquare,
  FileText,
  FolderKanban,
  Target,
  Wallet,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type Kpi = {
  label: string;
  value: string;
  hint: string;
};

async function loadOverview() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      configured: false as const,
      kpis: [] as Kpi[],
    };
  }

  const supabase = await createClient();

  const [
    clients,
    projects,
    openQuotes,
    openOpportunities,
    dueTasks,
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active_client")
      .is("deleted_at", null),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .not("status", "in", '("delivered","archived")')
      .is("deleted_at", null),
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "sent"])
      .is("deleted_at", null),
    supabase
      .from("opportunities")
      .select("estimated_value")
      .not("stage", "in", '("won","lost")')
      .is("deleted_at", null),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .lte("due_date", new Date().toISOString())
      .neq("status", "done")
      .neq("status", "cancelled")
      .is("deleted_at", null),
  ]);

  const pipelineValue = (openOpportunities.data ?? []).reduce(
    (sum, row) => sum + Number(row.estimated_value ?? 0),
    0,
  );

  const kpis: Kpi[] = [
    {
      label: "Clienti attivi",
      value: String(clients.count ?? 0),
      hint: "Organizzazioni con stato active_client",
    },
    {
      label: "Progetti in corso",
      value: String(projects.count ?? 0),
      hint: "Esclusi consegnati e archiviati",
    },
    {
      label: "Preventivi aperti",
      value: String(openQuotes.count ?? 0),
      hint: "Bozze e inviato",
    },
    {
      label: "Pipeline",
      value: new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(pipelineValue),
      hint: "Valore stimato opportunità aperte",
    },
    {
      label: "Attività in scadenza",
      value: String(dueTasks.count ?? 0),
      hint: "Scadute o in scadenza oggi",
    },
  ];

  return { configured: true as const, kpis };
}

export default async function DashboardOverviewPage() {
  const user = await requireUser("dashboard:access");
  const overview = await loadOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Ciao {user.fullName ?? user.email}. Ecco lo stato operativo di
          Articura.
        </p>
      </div>

      {!overview.configured ? (
        <EmptyState
          icon={Wallet}
          title="Collega Supabase per attivare i KPI"
          description="Copia .env.example in .env.local, inserisci URL e anon key del progetto Supabase, poi esegui la migrazione SQL in supabase/migrations."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {overview.kpis.map((kpi) => (
              <Card key={kpi.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{kpi.label}</CardDescription>
                  <CardTitle className="text-2xl">{kpi.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground-muted">{kpi.hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Azioni rapide</CardTitle>
                <CardDescription>
                  Nessun dato demo: crea il primo record reale.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/crm">
                    <Target className="h-4 w-4" />
                    CRM
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/clienti">
                    <Building2 className="h-4 w-4" />
                    Clienti
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/progetti">
                    <FolderKanban className="h-4 w-4" />
                    Progetti
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/preventivi">
                    <FileText className="h-4 w-4" />
                    Preventivi
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/attivita">
                    <CheckSquare className="h-4 w-4" />
                    Attività
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sicurezza</CardTitle>
                <CardDescription>
                  Accesso protetto lato server + RLS su Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-foreground-muted">
                <p>Ruolo corrente: {user.role}</p>
                <p>
                  Nessuna registrazione pubblica. Gli account si creano per
                  invito.
                </p>
                <p>
                  La service role key resta solo nelle variabili server-side.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
