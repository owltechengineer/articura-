import { Compass } from "lucide-react";

import { PlanWorkspace } from "@/components/dashboard/plan/plan-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import {
  listMilestones,
  listObjectives,
  listProjectOptions,
  listStaffProfiles,
  listTasks,
} from "@/lib/plan/queries";

export const instant = false;

export default async function StrategiaPage() {
  await requireUser("projects:read");
  const year = new Date().getFullYear();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Collega Supabase"
          description="Il piano operativo sarà disponibile dopo la configurazione del database."
        />
      </div>
    );
  }

  try {
    const objectives = await listObjectives(year);
    const milestones = await listMilestones(objectives.map((o) => o.id));
    const [tasks, profiles, projects] = await Promise.all([
      listTasks(),
      listStaffProfiles(),
      listProjectOptions(),
    ]);

    return (
      <div className="space-y-6">
        <Header />
        <PlanWorkspace
          objectives={objectives}
          milestones={milestones}
          tasks={tasks}
          profiles={profiles}
          projects={projects}
          year={year}
        />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore di caricamento";
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Schema piano da aggiornare"
          description={`Esegui APPLY_NOW_plan_phase_b.sql su Supabase. Dettaglio: ${message}`}
        />
      </div>
    );
  }
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent">
        <Compass className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Strategia · Fase B
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Piano operativo
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Obiettivi annuali/trimestrali, milestone e collegamento alle attività.
        I valori iniziali sono target modificabili, non risultati.
      </p>
    </div>
  );
}
