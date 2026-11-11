import { z } from "zod";

import {
  COMMERCIAL_PRIORITIES,
  QUALIFICATION_STATUSES,
} from "@/lib/crm/types";

export const prospectUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  legalName: z.string().trim().min(2).max(200),
  tradeName: z.string().trim().max(200).nullable().optional(),
  vatNumber: z.string().trim().max(32).nullable().optional(),
  email: z
    .union([z.string().trim().email(), z.literal(""), z.null()])
    .optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  website: z.string().trim().max(300).nullable().optional(),
  sector: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  province: z.string().trim().max(10).nullable().optional(),
  source: z.string().trim().max(120).nullable().optional(),
  verifiedAt: z.string().nullable().optional(),
  companySizeEstimate: z.string().trim().max(80).nullable().optional(),
  qualificationStatus: z.enum(QUALIFICATION_STATUSES).default("new"),
  interestedService: z.string().trim().max(160).nullable().optional(),
  commercialPriority: z.enum(COMMERCIAL_PRIORITIES).default("medium"),
  followUpAt: z.string().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  forceSaveDespiteDuplicates: z.boolean().optional().default(false),
});

export type ProspectUpsertInput = z.infer<typeof prospectUpsertSchema>;
