"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import {
  milestoneUpsertSchema,
  objectiveUpsertSchema,
  taskUpsertSchema,
} from "@/lib/plan/validations";
import { createClient } from "@/lib/supabase/server";

export type PlanActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
};

function revalidatePlan() {
  revalidatePath("/dashboard/strategia");
  revalidatePath("/dashboard/attivita");
  revalidatePath("/dashboard");
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function upsertObjectiveAction(
  input: unknown,
): Promise<PlanActionResult> {
  await requireUser("projects:write");
  const parsed = objectiveUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Obiettivo non valido." };

  const data = parsed.data;
  if (data.horizon === "quarterly" && !data.quarter) {
    return { ok: false, error: "Il trimestre è obbligatorio per obiettivi trimestrali." };
  }

  const supabase = await createClient();
  const payload = {
    title: data.title,
    description: emptyToNull(data.description),
    horizon: data.horizon,
    year: data.year,
    quarter: data.horizon === "quarterly" ? data.quarter ?? null : null,
    growth_phase: data.growthPhase,
    metric: data.metric,
    target_value: data.targetValue ?? null,
    target_min: data.targetMin ?? null,
    target_max: data.targetMax ?? null,
    unit: emptyToNull(data.unit),
    is_target_only: data.isTargetOnly,
    status: data.status,
    progress_percent: data.progressPercent,
    owner_id: data.ownerId ?? null,
    project_id: data.projectId ?? null,
    sort_order: data.sortOrder,
    starts_on: emptyToNull(data.startsOn),
    due_on: emptyToNull(data.dueOn),
    notes: emptyToNull(data.notes),
  };

  if (data.id) {
    const { error } = await supabase
      .from("strategic_objectives")
      .update(payload)
      .eq("id", data.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    revalidatePlan();
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("strategic_objectives")
    .insert(payload)
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? "Errore salvataggio" };
  }
  revalidatePlan();
  return { ok: true, id: created.id };
}

export async function softDeleteObjectiveAction(
  id: string,
): Promise<PlanActionResult> {
  await requireUser("projects:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("strategic_objectives")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePlan();
  return { ok: true, id };
}

export async function upsertMilestoneAction(
  input: unknown,
): Promise<PlanActionResult> {
  await requireUser("projects:write");
  const parsed = milestoneUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Milestone non valida." };

  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    objective_id: data.objectiveId,
    title: data.title,
    description: emptyToNull(data.description),
    growth_phase: data.growthPhase ?? null,
    status: data.status,
    progress_percent: data.progressPercent,
    owner_id: data.ownerId ?? null,
    project_id: data.projectId ?? null,
    starts_on: emptyToNull(data.startsOn),
    due_on: emptyToNull(data.dueOn),
    sort_order: data.sortOrder,
    completed_at:
      data.status === "done" ? new Date().toISOString() : null,
  };

  if (data.id) {
    const { error } = await supabase
      .from("strategic_milestones")
      .update(payload)
      .eq("id", data.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    revalidatePlan();
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("strategic_milestones")
    .insert(payload)
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? "Errore salvataggio" };
  }
  revalidatePlan();
  return { ok: true, id: created.id };
}

export async function softDeleteMilestoneAction(
  id: string,
): Promise<PlanActionResult> {
  await requireUser("projects:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("strategic_milestones")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePlan();
  return { ok: true, id };
}

export async function upsertTaskAction(
  input: unknown,
): Promise<PlanActionResult> {
  const user = await requireUser("projects:write");
  const parsed = taskUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Attività non valida." };

  const data = parsed.data;
  if (data.parentTaskId && data.parentTaskId === data.id) {
    return { ok: false, error: "Un’attività non può essere sottoattività di sé stessa." };
  }

  const supabase = await createClient();
  const payload = {
    title: data.title,
    description: emptyToNull(data.description),
    status: data.status,
    priority: data.priority,
    due_date: emptyToNull(data.dueDate),
    start_date: emptyToNull(data.startDate),
    progress_percent: data.progressPercent,
    assignee_id: data.assigneeId ?? null,
    organization_id: data.organizationId ?? null,
    project_id: data.projectId ?? null,
    opportunity_id: data.opportunityId ?? null,
    objective_id: data.objectiveId ?? null,
    milestone_id: data.milestoneId ?? null,
    parent_task_id: data.parentTaskId ?? null,
    funding_id: data.fundingId ?? null,
    growth_phase: data.growthPhase ?? null,
  };

  if (data.id) {
    const { error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", data.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    revalidatePlan();
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("tasks")
    .insert({ ...payload, created_by: user.id })
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? "Errore salvataggio" };
  }
  revalidatePlan();
  return { ok: true, id: created.id };
}

export async function softDeleteTaskAction(
  id: string,
): Promise<PlanActionResult> {
  await requireUser("projects:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePlan();
  return { ok: true, id };
}
