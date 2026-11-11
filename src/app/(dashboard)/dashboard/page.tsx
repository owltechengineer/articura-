import Link from "next/link";
import {
  Building2,
  CheckSquare,
  Compass,
  FileText,
  FolderKanban,
  Landmark,
  Megaphone,
  Target,
  Wallet,
} from "lucide-react";

import { KpiDashboard } from "@/components/dashboard/kpi/kpi-dashboard";
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
import { formatEur, formatNumberIT, formatPercent } from "@/lib/kpi/format";
import { loadKpiSnapshot } from "@/lib/kpi/queries";

export const instant = false;

export default async function DashboardOverviewPage() {
  const user = await requireUser("dashboard:access");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-8">
        <Intro name={user.fullName ?? user.email} />
        <EmptyState
          icon={Wallet}
          title="Collega Supabase per attivare i KPI"
          description="Copia .env.example in .env.local, inserisci URL e anon key, poi esegui le migrazioni SQL."
        />
      </div>
    );
  }

  try {
    const snapshot = await loadKpiSnapshot();
    const { raw } = snapshot;

    const highlights = [
      {
        label: "Prospect",
        value: formatNumberIT(raw.prospects),
        hint: "Reale",
      },
      {
        label: "Qualificati",
        value: formatNumberIT(raw.qualified),
        hint: "Reale",
      },
      {
        label: "Clienti acquisiti",
        value: formatNumberIT(raw.clientsWon),
        hint: "Reale",
      },
      {
        label: "Conversione",
        value: formatPercent(raw.conversionRate),
        hint: raw.conversionRate == null ? "n/d" : "Reale",
      },
      {
        label: "MRR",
        value:
          raw.mrrSource === "unavailable" ? "n/d" : formatEur(raw.mrrEur),
        hint:
          raw.mrrSource === "real"
            ? "Reale"
            : raw.mrrSource === "estimated"
              ? "Stimato"
              : "Non disponibile",
      },
    ];

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Intro name={user.fullName ?? user.email} />
          <Button asChild size="sm" variant="secondary">
            <Link href="/dashboard/analytics">KPI completi</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {highlights.map((kpi) => (
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

        <KpiDashboard snapshot={snapshot} compact />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Azioni rapide</CardTitle>
              <CardDescription>
                Nessun dato demo: opera sui record reali.
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
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/strategia">
                  <Compass className="h-4 w-4" />
                  Strategia
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/marketing">
                  <Megaphone className="h-4 w-4" />
                  Marketing
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/bandi">
                  <Landmark className="h-4 w-4" />
                  Bandi
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
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore di caricamento";
    return (
      <div className="space-y-8">
        <Intro name={user.fullName ?? user.email} />
        <EmptyState
          icon={Wallet}
          title="KPI non calcolabili"
          description={`Assicurati che le migrazioni A–D siano applicate. ${message}`}
        />
      </div>
    );
  }
}

function Intro({ name }: { name: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Ciao {name}. Stato operativo Articura su dati reali.
      </p>
    </div>
  );
}
