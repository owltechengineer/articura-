import { z } from "zod";

export const selectionAddonSchema = z.object({
  addonId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
});

export const configuratorSelectionSchema = z
  .object({
    mode: z.enum(["service", "package"]),
    serviceId: z.string().uuid().optional(),
    packageId: z.string().uuid().optional(),
    addons: z.array(selectionAddonSchema).default([]),
    promoCode: z.string().trim().max(64).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "service" && !value.serviceId) {
      ctx.addIssue({
        code: "custom",
        message: "Seleziona un servizio.",
        path: ["serviceId"],
      });
    }
    if (value.mode === "package" && !value.packageId) {
      ctx.addIssue({
        code: "custom",
        message: "Seleziona un pacchetto.",
        path: ["packageId"],
      });
    }
  });

export const quoteRequestContactSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().max(40).optional().nullable(),
  contactRole: z.string().trim().max(80).optional().nullable(),
  companyName: z.string().trim().min(2).max(160),
  vatNumber: z.string().trim().max(32).optional().nullable(),
  website: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  province: z.string().trim().max(10).optional().nullable(),
  sector: z.string().trim().max(120).optional().nullable(),
  companySize: z
    .enum(["1-5", "6-10", "11-20", "21-50", "50+", "non_so"])
    .optional()
    .nullable(),
  timeline: z
    .enum([
      "subito",
      "1_3_mesi",
      "3_6_mesi",
      "oltre_6_mesi",
      "solo_informazioni",
    ])
    .optional()
    .nullable(),
  currentTools: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
  privacyAccepted: z.boolean().refine((v) => v === true, {
    message: "Devi accettare la privacy policy.",
  }),
  marketingOptIn: z.boolean().default(false),
});

export const submitQuoteRequestSchema = z.object({
  selection: configuratorSelectionSchema,
  contact: quoteRequestContactSchema,
});

export const serviceUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(4000).optional().nullable(),
  features: z.array(z.string().trim().min(1)).default([]),
  priceKind: z.enum(["fixed", "from", "on_request", "per_unit"]),
  basePriceEuros: z.number().min(0).nullable().optional(),
  recurringPriceEuros: z.number().min(0).nullable().optional(),
  recurringPeriod: z.enum(["one_time", "monthly", "yearly"]).default("one_time"),
  isAvailableInConfigurator: z.boolean().default(true),
  status: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  addonIds: z.array(z.string().uuid()).default([]),
});

export const addonUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(4000).optional().nullable(),
  priceKind: z.enum(["fixed", "from", "on_request", "per_unit"]),
  unitPriceEuros: z.number().min(0).nullable().optional(),
  recurringPriceEuros: z.number().min(0).nullable().optional(),
  recurringPeriod: z.enum(["one_time", "monthly", "yearly"]).default("one_time"),
  minQty: z.number().int().min(1).default(1),
  maxQty: z.number().int().min(1).nullable().optional(),
  dependsOnAddonIds: z.array(z.string().uuid()).default([]),
  incompatibleAddonIds: z.array(z.string().uuid()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const packageUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(4000).optional().nullable(),
  features: z.array(z.string().trim().min(1)).default([]),
  priceKind: z.enum(["fixed", "from", "on_request", "per_unit"]),
  packagePriceEuros: z.number().min(0).nullable().optional(),
  recurringPriceEuros: z.number().min(0).nullable().optional(),
  recurringPeriod: z.enum(["one_time", "monthly", "yearly"]).default("one_time"),
  isAvailableInConfigurator: z.boolean().default(true),
  status: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  serviceIds: z.array(z.string().uuid()).default([]),
});

export const promotionUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().max(64).nullable().optional(),
  name: z.string().trim().min(2).max(120),
  kind: z.enum(["percent", "fixed_amount", "package_price"]),
  percentOff: z.number().gt(0).lte(100).nullable().optional(),
  amountOffEuros: z.number().min(0).nullable().optional(),
  packageId: z.string().uuid().nullable().optional(),
  promoPackagePriceEuros: z.number().min(0).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
  stackable: z.boolean().default(false),
});
