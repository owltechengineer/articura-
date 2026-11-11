import type {
  GrowthPhase,
  ObjectiveHorizon,
  ObjectiveMetric,
  PlanTask,
  StrategicMilestone,
  StrategicObjective,
} from "@/lib/plan/types";

type ObjectiveRow = {
  id: string;
  title: string;
  description: string | null;
  horizon: ObjectiveHorizon;
  year: number;
  quarter: number | null;
  growth_phase: GrowthPhase;
  metric: ObjectiveMetric;
  target_value: number | string | null;
  target_min: number | string | null;
  target_max: number | string | null;
  unit: string | null;
  is_target_only: boolean;
  status: string;
  progress_percent: number;
  owner_id: string | null;
  project_id: string | null;
  sort_order: number;
  starts_on: string | null;
  due_on: string | null;
  notes: string | null;
};

type MilestoneRow = {
  id: string;
  objective_id: string;
  title: string;
  description: string | null;
  growth_phase: GrowthPhase | null;
  status: string;
  progress_percent: number;
  owner_id: string | null;
  project_id: string | null;
  starts_on: string | null;
  due_on: string | null;
  completed_at: string | null;
  sort_order: number;
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  start_date: string | null;
  progress_percent: number;
  assignee_id: string | null;
  organization_id: string | null;
  project_id: string | null;
  opportunity_id: string | null;
  objective_id: string | null;
  milestone_id: string | null;
  parent_task_id: string | null;
  funding_id: string | null;
  growth_phase: GrowthPhase | null;
  created_at: string;
  updated_at: string;
};

function num(value: number | string | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapObjective(row: ObjectiveRow): StrategicObjective {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    horizon: row.horizon,
    year: row.year,
    quarter: row.quarter,
    growthPhase: row.growth_phase,
    metric: row.metric,
    targetValue: num(row.target_value),
    targetMin: num(row.target_min),
    targetMax: num(row.target_max),
    unit: row.unit,
    isTargetOnly: row.is_target_only,
    status: row.status,
    progressPercent: row.progress_percent,
    ownerId: row.owner_id,
    projectId: row.project_id,
    sortOrder: row.sort_order,
    startsOn: row.starts_on,
    dueOn: row.due_on,
    notes: row.notes,
  };
}

export function mapMilestone(row: MilestoneRow): StrategicMilestone {
  return {
    id: row.id,
    objectiveId: row.objective_id,
    title: row.title,
    description: row.description,
    growthPhase: row.growth_phase,
    status: row.status,
    progressPercent: row.progress_percent,
    ownerId: row.owner_id,
    projectId: row.project_id,
    startsOn: row.starts_on,
    dueOn: row.due_on,
    completedAt: row.completed_at,
    sortOrder: row.sort_order,
  };
}

export function mapTask(row: TaskRow): PlanTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    startDate: row.start_date,
    progressPercent: row.progress_percent ?? 0,
    assigneeId: row.assignee_id,
    organizationId: row.organization_id,
    projectId: row.project_id,
    opportunityId: row.opportunity_id,
    objectiveId: row.objective_id,
    milestoneId: row.milestone_id,
    parentTaskId: row.parent_task_id,
    fundingId: row.funding_id,
    growthPhase: row.growth_phase,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
