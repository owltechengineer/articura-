import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import {
  GROWTH_PHASES,
  OBJECTIVE_HORIZONS,
  OBJECTIVE_METRICS,
} from "@/lib/plan/types";

export const objectiveUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  horizon: z.enum(OBJECTIVE_HORIZONS).default("annual"),
  year: z.coerce.number().int().min(2020).max(2100),
  quarter: z.coerce.number().int().min(1).max(4).nullable().optional(),
  growthPhase: z.enum(GROWTH_PHASES).default("preparation_sales"),
  metric: z.enum(OBJECTIVE_METRICS).default("custom"),
  targetValue: z.coerce.number().nullable().optional(),
  targetMin: z.coerce.number().nullable().optional(),
  targetMax: z.coerce.number().nullable().optional(),
  unit: z.string().trim().max(40).nullable().optional(),
  isTargetOnly: z.boolean().default(true),
  status: z.enum(TASK_STATUSES).default("todo"),
  progressPercent: z.coerce.number().int().min(0).max(100).default(0),
  ownerId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
  startsOn: z.string().nullable().optional(),
  dueOn: z.string().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const milestoneUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  objectiveId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  growthPhase: z.enum(GROWTH_PHASES).nullable().optional(),
  status: z.enum(TASK_STATUSES).default("todo"),
  progressPercent: z.coerce.number().int().min(0).max(100).default(0),
  ownerId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  startsOn: z.string().nullable().optional(),
  dueOn: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const taskUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(TASK_STATUSES).default("todo"),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  dueDate: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  progressPercent: z.coerce.number().int().min(0).max(100).default(0),
  assigneeId: z.string().uuid().nullable().optional(),
  organizationId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  opportunityId: z.string().uuid().nullable().optional(),
  objectiveId: z.string().uuid().nullable().optional(),
  milestoneId: z.string().uuid().nullable().optional(),
  parentTaskId: z.string().uuid().nullable().optional(),
  fundingId: z.string().uuid().nullable().optional(),
  growthPhase: z.enum(GROWTH_PHASES).nullable().optional(),
});

export type ObjectiveUpsertInput = z.infer<typeof objectiveUpsertSchema>;
export type MilestoneUpsertInput = z.infer<typeof milestoneUpsertSchema>;
export type TaskUpsertInput = z.infer<typeof taskUpsertSchema>;
