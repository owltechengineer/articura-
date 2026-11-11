import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import {
  GROWTH_PHASE_LABELS,
  OBJECTIVE_HORIZON_LABELS,
  OBJECTIVE_METRIC_LABELS,
  type GrowthPhase,
  type ObjectiveHorizon,
  type ObjectiveMetric,
  type StrategicObjective,
} from "@/lib/plan/types";

export const STATUS_LABELS: Record<(typeof TASK_STATUSES)[number], string> = {
  todo: "Da fare",
  in_progress: "In corso",
  blocked: "Bloccata",
  done: "Completata",
  cancelled: "Annullata",
};

export const PRIORITY_LABELS: Record<(typeof TASK_PRIORITIES)[number], string> = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export function growthPhaseLabel(phase: GrowthPhase | null | undefined) {
  if (!phase) return "—";
  return GROWTH_PHASE_LABELS[phase];
}

export function horizonLabel(horizon: ObjectiveHorizon) {
  return OBJECTIVE_HORIZON_LABELS[horizon];
}

export function metricLabel(metric: ObjectiveMetric) {
  return OBJECTIVE_METRIC_LABELS[metric];
}

export function formatTarget(objective: StrategicObjective): string {
  const unit = objective.unit ? ` ${objective.unit}` : "";
  if (objective.targetMin != null && objective.targetMax != null) {
    return `${objective.targetMin}–${objective.targetMax}${unit}`;
  }
  if (objective.targetValue != null) {
    return `${objective.targetValue}${unit}`;
  }
  return "Obiettivo non numerico";
}

export function formatDateIT(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Rome",
  }).format(date);
}
