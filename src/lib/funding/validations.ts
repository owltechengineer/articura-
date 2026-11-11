import { z } from "zod";

import { FUNDING_STATUSES } from "@/lib/funding/types";

export const fundingUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(250),
  promoter: z.string().trim().max(200).nullable().optional(),
  region: z.string().trim().max(120).nullable().optional(),
  territory: z.string().trim().max(200).nullable().optional(),
  officialUrl: z
    .union([z.string().trim().url(), z.literal(""), z.null()])
    .optional(),
  aidType: z.string().trim().max(160).nullable().optional(),
  maxContributionEur: z.coerce.number().nonnegative().nullable().optional(),
  fundingPercent: z.coerce.number().min(0).max(100).nullable().optional(),
  minInvestmentEur: z.coerce.number().nonnegative().nullable().optional(),
  eligibilityRequirements: z.string().trim().max(10000).nullable().optional(),
  opensOn: z.string().nullable().optional(),
  closesOn: z.string().nullable().optional(),
  lastVerifiedAt: z.string().nullable().optional(),
  status: z.enum(FUNDING_STATUSES).default("to_verify"),
  reminderAt: z.string().nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  organizationId: z.string().uuid().nullable().optional(),
});

export const fundingDocumentUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  fundingId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  isRequired: z.boolean().default(true),
  isDone: z.boolean().default(false),
  dueOn: z.string().nullable().optional(),
  storagePath: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type FundingUpsertInput = z.infer<typeof fundingUpsertSchema>;
export type FundingDocumentUpsertInput = z.infer<
  typeof fundingDocumentUpsertSchema
>;
