import "server-only";

import { mapMilestone, mapObjective, mapTask } from "@/lib/plan/map";
import type {
  PlanTask,
  StrategicMilestone,
  StrategicObjective,
} from "@/lib/plan/types";
import { createClient } from "@/lib/supabase/server";

const OBJECTIVE_SELECT = `
  id, title, description, horizon, year, quarter, growth_phase, metric,
  target_value, target_min, target_max, unit, is_target_only, status,
  progress_percent, owner_id, project_id, sort_order, starts_on, due_on, notes
`;

const MILESTONE_SELECT = `
  id, objective_id, title, description, growth_phase, status, progress_percent,
  owner_id, project_id, starts_on, due_on, completed_at, sort_order
`;

const TASK_SELECT = `
  id, title, description, status, priority, due_date, start_date, progress_percent,
  assignee_id, organization_id, project_id, opportunity_id, objective_id,
  milestone_id, parent_task_id, funding_id, growth_phase, created_at, updated_at
`;

export async function listObjectives(year?: number): Promise<StrategicObjective[]> {
  const supabase = await createClient();
  let q = supabase
    .from("strategic_objectives")
    .select(OBJECTIVE_SELECT)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (year) q = q.eq("year", year);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapObjective);
}

export async function listMilestones(
  objectiveIds?: string[],
): Promise<StrategicMilestone[]> {
  const supabase = await createClient();
  let q = supabase
    .from("strategic_milestones")
    .select(MILESTONE_SELECT)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (objectiveIds) {
    if (objectiveIds.length === 0) return [];
    q = q.in("objective_id", objectiveIds);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapMilestone);
}

export async function listTasks(options?: {
  objectiveId?: string;
  projectId?: string;
  organizationId?: string;
}): Promise<PlanTask[]> {
  const supabase = await createClient();
  let q = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (options?.objectiveId) q = q.eq("objective_id", options.objectiveId);
  if (options?.projectId) q = q.eq("project_id", options.projectId);
  if (options?.organizationId) {
    q = q.eq("organization_id", options.organizationId);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTask);
}

export async function listStaffProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listOrgOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, legal_name, status")
    .is("deleted_at", null)
    .order("legal_name", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listProjectOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status")
    .is("deleted_at", null)
    .order("name", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}
