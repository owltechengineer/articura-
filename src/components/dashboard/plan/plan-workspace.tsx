"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import {
  softDeleteMilestoneAction,
  softDeleteObjectiveAction,
  upsertMilestoneAction,
  upsertObjectiveAction,
} from "@/app/actions/plan";
import {
  formatDateIT,
  formatTarget,
  growthPhaseLabel,
  horizonLabel,
  metricLabel,
  STATUS_LABELS,
} from "@/components/dashboard/plan/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TASK_STATUSES } from "@/lib/constants";
import {
  GROWTH_PHASES,
  GROWTH_PHASE_LABELS,
  OBJECTIVE_HORIZONS,
  OBJECTIVE_METRICS,
  type GrowthPhase,
  type ObjectiveHorizon,
  type ObjectiveMetric,
  type PlanTask,
  type StrategicMilestone,
  type StrategicObjective,
} from "@/lib/plan/types";

type Profile = { id: string; full_name: string | null; email: string };
type Project = { id: string; name: string };

type Props = {
  objectives: StrategicObjective[];
  milestones: StrategicMilestone[];
  tasks: PlanTask[];
  profiles: Profile[];
  projects: Project[];
  year: number;
};

type ObjectiveFormState = {
  title: string;
  description: string;
  horizon: ObjectiveHorizon;
  year: number;
  quarter: string;
  growthPhase: GrowthPhase;
  metric: ObjectiveMetric;
  targetValue: string;
  targetMin: string;
  targetMax: string;
  unit: string;
  progressPercent: string;
  status: (typeof TASK_STATUSES)[number];
  ownerId: string;
  projectId: string;
  startsOn: string;
  dueOn: string;
  notes: string;
};

const emptyObjective: ObjectiveFormState = {
  title: "",
  description: "",
  horizon: "annual",
  year: new Date().getFullYear(),
  quarter: "",
  growthPhase: "preparation_sales",
  metric: "custom",
  targetValue: "",
  targetMin: "",
  targetMax: "",
  unit: "",
  progressPercent: "0",
  status: "todo",
  ownerId: "",
  projectId: "",
  startsOn: "",
  dueOn: "",
  notes: "",
};

export function PlanWorkspace({
  objectives,
  milestones,
  tasks,
  profiles,
  projects,
  year,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | undefined>();
  const [objectiveForm, setObjectiveForm] =
    useState<ObjectiveFormState>(emptyObjective);
  const [milestoneForms, setMilestoneForms] = useState<
    Record<string, { title: string; dueOn: string; growthPhase: GrowthPhase | "" }>
  >({});

  const byPhase = useMemo(() => {
    return GROWTH_PHASES.map((phase) => ({
      phase,
      objectives: objectives.filter((o) => o.growthPhase === phase),
    }));
  }, [objectives]);

  function openCreateObjective(phase?: GrowthPhase) {
    setEditingObjectiveId(undefined);
    setObjectiveForm({
      ...emptyObjective,
      year,
      growthPhase: phase ?? "preparation_sales",
    });
    setShowObjectiveForm(true);
    setError(null);
  }

  function openEditObjective(o: StrategicObjective) {
    setEditingObjectiveId(o.id);
    setObjectiveForm({
      title: o.title,
      description: o.description ?? "",
      horizon: o.horizon,
      year: o.year,
      quarter: o.quarter ? String(o.quarter) : "",
      growthPhase: o.growthPhase,
      metric: o.metric,
      targetValue: o.targetValue == null ? "" : String(o.targetValue),
      targetMin: o.targetMin == null ? "" : String(o.targetMin),
      targetMax: o.targetMax == null ? "" : String(o.targetMax),
      unit: o.unit ?? "",
      progressPercent: String(o.progressPercent),
      status: o.status as (typeof TASK_STATUSES)[number],
      ownerId: o.ownerId ?? "",
      projectId: o.projectId ?? "",
      startsOn: o.startsOn ?? "",
      dueOn: o.dueOn ?? "",
      notes: o.notes ?? "",
    });
    setShowObjectiveForm(true);
    setError(null);
  }

  function saveObjective() {
    setError(null);
    startTransition(async () => {
      const result = await upsertObjectiveAction({
        id: editingObjectiveId,
        title: objectiveForm.title,
        description: objectiveForm.description || null,
        horizon: objectiveForm.horizon,
        year: objectiveForm.year,
        quarter: objectiveForm.quarter ? Number(objectiveForm.quarter) : null,
        growthPhase: objectiveForm.growthPhase,
        metric: objectiveForm.metric,
        targetValue: objectiveForm.targetValue
          ? Number(objectiveForm.targetValue)
          : null,
        targetMin: objectiveForm.targetMin
          ? Number(objectiveForm.targetMin)
          : null,
        targetMax: objectiveForm.targetMax
          ? Number(objectiveForm.targetMax)
          : null,
        unit: objectiveForm.unit || null,
        isTargetOnly: true,
        status: objectiveForm.status,
        progressPercent: Number(objectiveForm.progressPercent || 0),
        ownerId: objectiveForm.ownerId || null,
        projectId: objectiveForm.projectId || null,
        startsOn: objectiveForm.startsOn || null,
        dueOn: objectiveForm.dueOn || null,
        notes: objectiveForm.notes || null,
      });
      if (!result.ok) {
        setError(result.error ?? "Errore");
        return;
      }
      setShowObjectiveForm(false);
      router.refresh();
    });
  }

  function addMilestone(objectiveId: string) {
    const form = milestoneForms[objectiveId] ?? {
      title: "",
      dueOn: "",
      growthPhase: "" as const,
    };
    if (form.title.trim().length < 2) {
      setError("Titolo milestone troppo corto.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await upsertMilestoneAction({
        objectiveId,
        title: form.title,
        dueOn: form.dueOn || null,
        growthPhase: form.growthPhase || null,
      });
      if (!result.ok) {
        setError(result.error ?? "Errore");
        return;
      }
      setMilestoneForms((prev) => ({
        ...prev,
        [objectiveId]: { title: "", dueOn: "", growthPhase: "" },
      }));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-background-secondary/40 p-3 text-sm text-foreground-muted">
        Gli obiettivi sotto sono <strong className="text-foreground">target modificabili</strong>,
        non risultati raggiunti. I KPI reali restano distinti (Fase E).
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-foreground-muted">Anno {year}</p>
        <Button type="button" size="sm" onClick={() => openCreateObjective()}>
          <Plus /> Nuovo obiettivo
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {showObjectiveForm ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold">
            {editingObjectiveId ? "Modifica obiettivo" : "Nuovo obiettivo"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titolo *">
              <Input
                value={objectiveForm.title}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Fase">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={objectiveForm.growthPhase}
                onChange={(e) =>
                  setObjectiveForm((f) => ({
                    ...f,
                    growthPhase: e.target.value as GrowthPhase,
                  }))
                }
              >
                {GROWTH_PHASES.map((p) => (
                  <option key={p} value={p}>
                    {GROWTH_PHASE_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Orizzonte">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={objectiveForm.horizon}
                onChange={(e) =>
                  setObjectiveForm((f) => ({
                    ...f,
                    horizon: e.target.value as ObjectiveHorizon,
                  }))
                }
              >
                {OBJECTIVE_HORIZONS.map((h) => (
                  <option key={h} value={h}>
                    {horizonLabel(h)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Anno">
              <Input
                type="number"
                value={objectiveForm.year}
                onChange={(e) =>
                  setObjectiveForm((f) => ({
                    ...f,
                    year: Number(e.target.value),
                  }))
                }
              />
            </Field>
            {objectiveForm.horizon === "quarterly" ? (
              <Field label="Trimestre">
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={objectiveForm.quarter}
                  onChange={(e) =>
                    setObjectiveForm((f) => ({ ...f, quarter: e.target.value }))
                  }
                />
              </Field>
            ) : null}
            <Field label="Metrica">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={objectiveForm.metric}
                onChange={(e) =>
                  setObjectiveForm((f) => ({
                    ...f,
                    metric: e.target.value as typeof objectiveForm.metric,
                  }))
                }
              >
                {OBJECTIVE_METRICS.map((m) => (
                  <option key={m} value={m}>
                    {metricLabel(m)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target">
              <Input
                value={objectiveForm.targetValue}
                onChange={(e) =>
                  setObjectiveForm((f) => ({
                    ...f,
                    targetValue: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Target min">
              <Input
                value={objectiveForm.targetMin}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, targetMin: e.target.value }))
                }
              />
            </Field>
            <Field label="Target max">
              <Input
                value={objectiveForm.targetMax}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, targetMax: e.target.value }))
                }
              />
            </Field>
            <Field label="Unità">
              <Input
                value={objectiveForm.unit}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, unit: e.target.value }))
                }
              />
            </Field>
            <Field label="Avanzamento %">
              <Input
                type="number"
                min={0}
                max={100}
                value={objectiveForm.progressPercent}
                onChange={(e) =>
                  setObjectiveForm((f) => ({
                    ...f,
                    progressPercent: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Stato">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={objectiveForm.status}
                onChange={(e) =>
                  setObjectiveForm((f) => ({
                    ...f,
                    status: e.target.value as typeof objectiveForm.status,
                  }))
                }
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Responsabile">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={objectiveForm.ownerId}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, ownerId: e.target.value }))
                }
              >
                <option value="">—</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Progetto collegato">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={objectiveForm.projectId}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, projectId: e.target.value }))
                }
              >
                <option value="">—</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Inizio">
              <Input
                type="date"
                value={objectiveForm.startsOn}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, startsOn: e.target.value }))
                }
              />
            </Field>
            <Field label="Scadenza">
              <Input
                type="date"
                value={objectiveForm.dueOn}
                onChange={(e) =>
                  setObjectiveForm((f) => ({ ...f, dueOn: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Descrizione / note">
            <textarea
              className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={objectiveForm.description || objectiveForm.notes}
              onChange={(e) =>
                setObjectiveForm((f) => ({
                  ...f,
                  description: e.target.value,
                  notes: e.target.value,
                }))
              }
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowObjectiveForm(false)}
            >
              Annulla
            </Button>
            <Button type="button" disabled={pending} onClick={saveObjective}>
              Salva
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        {byPhase.map(({ phase, objectives: phaseObjectives }) => (
          <section key={phase} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">
                {GROWTH_PHASE_LABELS[phase]}
              </h2>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openCreateObjective(phase)}
              >
                <Plus /> Obiettivo
              </Button>
            </div>

            {phaseObjectives.length === 0 ? (
              <p className="text-sm text-foreground-muted">
                Nessun obiettivo in questa fase.
              </p>
            ) : (
              phaseObjectives.map((objective) => {
                const objMilestones = milestones.filter(
                  (m) => m.objectiveId === objective.id,
                );
                const objTasks = tasks.filter(
                  (t) => t.objectiveId === objective.id,
                );
                const mf = milestoneForms[objective.id] ?? {
                  title: "",
                  dueOn: "",
                  growthPhase: "",
                };

                return (
                  <div
                    key={objective.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">{objective.title}</h3>
                          <Badge variant="outline">
                            {horizonLabel(objective.horizon)}
                          </Badge>
                          <Badge variant="secondary">
                            Target: {formatTarget(objective)}
                          </Badge>
                          <Badge>
                            {
                              STATUS_LABELS[
                                objective.status as keyof typeof STATUS_LABELS
                              ]
                            }
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-foreground-muted">
                          {metricLabel(objective.metric)} · avanzamento{" "}
                          {objective.progressPercent}% · scadenza{" "}
                          {formatDateIT(objective.dueOn)}
                        </p>
                        {objective.description ? (
                          <p className="mt-2 text-sm text-foreground-muted">
                            {objective.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditObjective(objective)}
                        >
                          Modifica
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              await softDeleteObjectiveAction(objective.id);
                              router.refresh();
                            })
                          }
                        >
                          Archivia
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                          Milestone
                        </h4>
                        <ul className="mt-2 space-y-2">
                          {objMilestones.map((m) => (
                            <li
                              key={m.id}
                              className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                            >
                              <div>
                                <div className="font-medium">{m.title}</div>
                                <div className="text-xs text-foreground-muted">
                                  {growthPhaseLabel(m.growthPhase)} ·{" "}
                                  {formatDateIT(m.dueOn)} · {m.progressPercent}%
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={pending}
                                onClick={() =>
                                  startTransition(async () => {
                                    await softDeleteMilestoneAction(m.id);
                                    router.refresh();
                                  })
                                }
                              >
                                ×
                              </Button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                          <Input
                            placeholder="Nuova milestone"
                            value={mf.title}
                            onChange={(e) =>
                              setMilestoneForms((prev) => ({
                                ...prev,
                                [objective.id]: {
                                  ...mf,
                                  title: e.target.value,
                                },
                              }))
                            }
                          />
                          <Input
                            type="date"
                            value={mf.dueOn}
                            onChange={(e) =>
                              setMilestoneForms((prev) => ({
                                ...prev,
                                [objective.id]: {
                                  ...mf,
                                  dueOn: e.target.value,
                                },
                              }))
                            }
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={pending}
                            onClick={() => addMilestone(objective.id)}
                          >
                            Aggiungi
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                          Attività collegate ({objTasks.length})
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm">
                          {objTasks.length === 0 ? (
                            <li className="text-foreground-muted">
                              Nessuna. Creale in Attività collegandole a questo
                              obiettivo.
                            </li>
                          ) : (
                            objTasks.slice(0, 8).map((t) => (
                              <li key={t.id} className="text-foreground-muted">
                                <span className="text-foreground">{t.title}</span>
                                {t.parentTaskId ? " (sottoattività)" : ""} ·{" "}
                                {
                                  STATUS_LABELS[
                                    t.status as keyof typeof STATUS_LABELS
                                  ]
                                }
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
