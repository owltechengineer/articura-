export const GROWTH_PHASES = [
  "preparation_sales",
  "commercial_validation",
  "saas_standardization",
  "controlled_growth",
] as const;

export type GrowthPhase = (typeof GROWTH_PHASES)[number];

export const GROWTH_PHASE_LABELS: Record<GrowthPhase, string> = {
  preparation_sales: "1. Preparazione e prime vendite",
  commercial_validation: "2. Validazione commerciale",
  saas_standardization: "3. Standardizzazione SaaS",
  controlled_growth: "4. Crescita controllata",
};

export const OBJECTIVE_HORIZONS = ["annual", "quarterly"] as const;
export type ObjectiveHorizon = (typeof OBJECTIVE_HORIZONS)[number];

export const OBJECTIVE_HORIZON_LABELS: Record<ObjectiveHorizon, string> = {
  annual: "Annuale",
  quarterly: "Trimestrale",
};

export const OBJECTIVE_METRICS = [
  "qualified_prospects",
  "paying_clients",
  "standardized_products",
  "mrr_eur",
  "custom",
] as const;
export type ObjectiveMetric = (typeof OBJECTIVE_METRICS)[number];

export const OBJECTIVE_METRIC_LABELS: Record<ObjectiveMetric, string> = {
  qualified_prospects: "Prospect qualificati",
  paying_clients: "Clienti paganti",
  standardized_products: "Prodotti standardizzati",
  mrr_eur: "MRR (€)",
  custom: "Personalizzato",
};

export type StrategicObjective = {
  id: string;
  title: string;
  description: string | null;
  horizon: ObjectiveHorizon;
  year: number;
  quarter: number | null;
  growthPhase: GrowthPhase;
  metric: ObjectiveMetric;
  targetValue: number | null;
  targetMin: number | null;
  targetMax: number | null;
  unit: string | null;
  isTargetOnly: boolean;
  status: string;
  progressPercent: number;
  ownerId: string | null;
  projectId: string | null;
  sortOrder: number;
  startsOn: string | null;
  dueOn: string | null;
  notes: string | null;
};

export type StrategicMilestone = {
  id: string;
  objectiveId: string;
  title: string;
  description: string | null;
  growthPhase: GrowthPhase | null;
  status: string;
  progressPercent: number;
  ownerId: string | null;
  projectId: string | null;
  startsOn: string | null;
  dueOn: string | null;
  completedAt: string | null;
  sortOrder: number;
};

export type PlanTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  startDate: string | null;
  progressPercent: number;
  assigneeId: string | null;
  organizationId: string | null;
  projectId: string | null;
  opportunityId: string | null;
  objectiveId: string | null;
  milestoneId: string | null;
  parentTaskId: string | null;
  fundingId: string | null;
  growthPhase: GrowthPhase | null;
  createdAt: string;
  updatedAt: string;
};
