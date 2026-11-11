"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { softDeleteTaskAction, upsertTaskAction } from "@/app/actions/plan";
import {
  formatDateIT,
  growthPhaseLabel,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/components/dashboard/plan/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import {
  GROWTH_PHASES,
  GROWTH_PHASE_LABELS,
  type GrowthPhase,
  type PlanTask,
  type StrategicMilestone,
  type StrategicObjective,
} from "@/lib/plan/types";

type Profile = { id: string; full_name: string | null; email: string };
type Org = { id: string; legal_name: string; status: string };
type Project = { id: string; name: string };

type Props = {
  tasks: PlanTask[];
  objectives: StrategicObjective[];
  milestones: StrategicMilestone[];
  profiles: Profile[];
  organizations: Org[];
  projects: Project[];
};

type FormState = {
  title: string;
  description: string;
  status: (typeof TASK_STATUSES)[number];
  priority: (typeof TASK_PRIORITIES)[number];
  startDate: string;
  dueDate: string;
  progressPercent: string;
  assigneeId: string;
  organizationId: string;
  projectId: string;
  objectiveId: string;
  milestoneId: string;
  parentTaskId: string;
  growthPhase: GrowthPhase | "";
};

const emptyForm: FormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  startDate: "",
  dueDate: "",
  progressPercent: "0",
  assigneeId: "",
  organizationId: "",
  projectId: "",
  objectiveId: "",
  milestoneId: "",
  parentTaskId: "",
  growthPhase: "",
};

export function TasksWorkspace({
  tasks,
  objectives,
  milestones,
  profiles,
  organizations,
  projects,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const parents = useMemo(
    () => tasks.filter((t) => !t.parentTaskId),
    [tasks],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, query]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, PlanTask[]>();
    for (const t of filtered) {
      if (!t.parentTaskId) continue;
      const list = map.get(t.parentTaskId) ?? [];
      list.push(t);
      map.set(t.parentTaskId, list);
    }
    return map;
  }, [filtered]);

  const rootTasks = filtered.filter((t) => !t.parentTaskId);

  function openCreate(parentId?: string) {
    setEditingId(undefined);
    setForm({ ...emptyForm, parentTaskId: parentId ?? "" });
    setOpen(true);
    setError(null);
  }

  function openEdit(task: PlanTask) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status as FormState["status"],
      priority: task.priority as FormState["priority"],
      startDate: task.startDate?.slice(0, 10) ?? "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : "",
      progressPercent: String(task.progressPercent),
      assigneeId: task.assigneeId ?? "",
      organizationId: task.organizationId ?? "",
      projectId: task.projectId ?? "",
      objectiveId: task.objectiveId ?? "",
      milestoneId: task.milestoneId ?? "",
      parentTaskId: task.parentTaskId ?? "",
      growthPhase: task.growthPhase ?? "",
    });
    setOpen(true);
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertTaskAction({
        id: editingId,
        title: form.title,
        description: form.description || null,
        status: form.status,
        priority: form.priority,
        startDate: form.startDate || null,
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : null,
        progressPercent: Number(form.progressPercent || 0),
        assigneeId: form.assigneeId || null,
        organizationId: form.organizationId || null,
        projectId: form.projectId || null,
        objectiveId: form.objectiveId || null,
        milestoneId: form.milestoneId || null,
        parentTaskId: form.parentTaskId || null,
        growthPhase: form.growthPhase || null,
      });
      if (!result.ok) {
        setError(result.error ?? "Errore");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const milestoneOptions = form.objectiveId
    ? milestones.filter((m) => m.objectiveId === form.objectiveId)
    : milestones;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="max-w-sm"
          placeholder="Cerca attività…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="button" size="sm" onClick={() => openCreate()}>
          <Plus /> Nuova attività
        </Button>
      </div>

      {open ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold">
            {editingId ? "Modifica attività" : "Nuova attività"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titolo *">
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Priorità">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as FormState["priority"],
                  }))
                }
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stato">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as FormState["status"],
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
            <Field label="Avanzamento %">
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progressPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, progressPercent: e.target.value }))
                }
              />
            </Field>
            <Field label="Inizio">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </Field>
            <Field label="Scadenza">
              <Input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </Field>
            <Field label="Responsabile">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.assigneeId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assigneeId: e.target.value }))
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
            <Field label="Fase crescita">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.growthPhase}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    growthPhase: e.target.value as GrowthPhase | "",
                  }))
                }
              >
                <option value="">—</option>
                {GROWTH_PHASES.map((p) => (
                  <option key={p} value={p}>
                    {GROWTH_PHASE_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cliente / prospect">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.organizationId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, organizationId: e.target.value }))
                }
              >
                <option value="">—</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.legal_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Progetto">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.projectId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectId: e.target.value }))
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
            <Field label="Obiettivo">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.objectiveId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    objectiveId: e.target.value,
                    milestoneId: "",
                  }))
                }
              >
                <option value="">—</option>
                {objectives.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Milestone">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.milestoneId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, milestoneId: e.target.value }))
                }
              >
                <option value="">—</option>
                {milestoneOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Attività padre">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.parentTaskId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parentTaskId: e.target.value }))
                }
              >
                <option value="">— (attività principale)</option>
                {parents
                  .filter((p) => p.id !== editingId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <Field label="Descrizione">
            <textarea
              className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="button" disabled={pending} onClick={save}>
              Salva
            </Button>
          </div>
        </div>
      ) : null}

      {rootTasks.length === 0 ? (
        <EmptyState
          title="Nessuna attività"
          description="Crea attività e sottoattività collegabili a obiettivi, progetti e clienti."
          action={
            <Button type="button" size="sm" onClick={() => openCreate()}>
              <Plus /> Aggiungi
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {rootTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              depth={0}
              children={childrenByParent.get(task.id) ?? []}
              childrenByParent={childrenByParent}
              objectives={objectives}
              organizations={organizations}
              projects={projects}
              profiles={profiles}
              pending={pending}
              onEdit={openEdit}
              onAddSub={() => openCreate(task.id)}
              onDelete={(id) =>
                startTransition(async () => {
                  await softDeleteTaskAction(id);
                  router.refresh();
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  depth,
  children,
  childrenByParent,
  objectives,
  organizations,
  projects,
  profiles,
  pending,
  onEdit,
  onAddSub,
  onDelete,
}: {
  task: PlanTask;
  depth: number;
  children: PlanTask[];
  childrenByParent: Map<string, PlanTask[]>;
  objectives: StrategicObjective[];
  organizations: Org[];
  projects: Project[];
  profiles: Profile[];
  pending: boolean;
  onEdit: (task: PlanTask) => void;
  onAddSub: () => void;
  onDelete: (id: string) => void;
}) {
  const org = organizations.find((o) => o.id === task.organizationId);
  const project = projects.find((p) => p.id === task.projectId);
  const objective = objectives.find((o) => o.id === task.objectiveId);
  const assignee = profiles.find((p) => p.id === task.assigneeId);

  return (
    <div>
      <div
        className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ marginLeft: depth * 16 }}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{task.title}</span>
            <Badge variant="outline">
              {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
            </Badge>
            <Badge variant="secondary">
              {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
            </Badge>
            {depth > 0 ? <Badge variant="outline">Sottoattività</Badge> : null}
          </div>
          <div className="mt-1 text-xs text-foreground-muted">
            {[
              growthPhaseLabel(task.growthPhase),
              assignee ? `Resp. ${assignee.full_name || assignee.email}` : null,
              org?.legal_name,
              project?.name,
              objective?.title,
              `Scad. ${formatDateIT(task.dueDate)}`,
              `${task.progressPercent}%`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(task)}>
            Modifica
          </Button>
          {depth === 0 ? (
            <Button type="button" size="sm" variant="outline" onClick={onAddSub}>
              Sottoattività
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => onDelete(task.id)}
          >
            Archivia
          </Button>
        </div>
      </div>
      {children.map((child) => (
        <TaskRow
          key={child.id}
          task={child}
          depth={depth + 1}
          children={childrenByParent.get(child.id) ?? []}
          childrenByParent={childrenByParent}
          objectives={objectives}
          organizations={organizations}
          projects={projects}
          profiles={profiles}
          pending={pending}
          onEdit={onEdit}
          onAddSub={onAddSub}
          onDelete={onDelete}
        />
      ))}
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
