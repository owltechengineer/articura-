import { z } from "zod";

import {
  SOCIAL_CONTENT_STATUSES,
  SOCIAL_CONTENT_TYPES,
  SOCIAL_PLATFORMS,
} from "@/lib/social/types";

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(255),
  path: z.string().trim().min(1).max(500),
  mimeType: z.string().trim().max(120).nullable().optional(),
  sizeBytes: z.number().int().nonnegative().nullable().optional(),
});

export const campaignUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  startsOn: z.string().nullable().optional(),
  endsOn: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "completed", "archived"]).default("active"),
  ownerId: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const socialContentUpsertSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(2000).nullable().optional(),
    body: z.string().trim().max(10000).nullable().optional(),
    platform: z.enum(SOCIAL_PLATFORMS),
    contentType: z.enum(SOCIAL_CONTENT_TYPES).default("post"),
    status: z.enum(SOCIAL_CONTENT_STATUSES).default("idea"),
    scheduledFor: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    campaignId: z.string().uuid().nullable().optional(),
    organizationId: z.string().uuid().nullable().optional(),
    objectiveId: z.string().uuid().nullable().optional(),
    isTemplate: z.boolean().default(false),
    isIdeaArchive: z.boolean().default(false),
    attachments: z.array(attachmentSchema).max(20).default([]),
    notes: z.string().trim().max(5000).nullable().optional(),
    ownerId: z.string().uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "scheduled" && !data.scheduledFor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data di pubblicazione prevista obbligatoria per lo stato Programmato.",
        path: ["scheduledFor"],
      });
    }
    if (data.status === "published" && !data.publishedAt && !data.scheduledFor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indicare publishedAt (o scheduledFor) per marcare Pubblicato manualmente.",
        path: ["publishedAt"],
      });
    }
  });

export type CampaignUpsertInput = z.infer<typeof campaignUpsertSchema>;
export type SocialContentUpsertInput = z.infer<typeof socialContentUpsertSchema>;
