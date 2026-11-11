import { CheckSquare } from "lucide-react";

import { TasksWorkspace } from "@/components/dashboard/plan/tasks-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import {
  listMilestones,
  listObjectives,
  listOrgOptions,
  listProjectOptions,
  listStaffProfiles,
  listTasks,
} from "@/lib/plan/queries";

export const instant = false;

export default async function AttivitaPage() {
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
          description="Le attività saranno disponibili dopo la configurazione del database."
        />
      </div>
    );
  }

  try {
    const [tasks, objectives, milestones, profiles, organizations, projects] =
      await Promise.all([
        listTasks(),
        listObjectives(),
        listMilestones(),
        listStaffProfiles(),
        listOrgOptions(),
        listProjectOptions(),
      ]);

    return (
      <div className="space-y-6">
        <Header />
        <TasksWorkspace
          tasks={tasks}
          objectives={objectives}
          milestones={milestones}
          profiles={profiles}
          organizations={organizations}
          projects={projects}
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
          title="Schema attività da aggiornare"
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
        <CheckSquare className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Operatività
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Attività</h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Attività e sottoattività sulla tabella tasks esistente, collegabili a
        obiettivi, milestone, progetti e anagrafiche.
      </p>
    </div>
  );
}
