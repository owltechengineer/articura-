import { z } from "zod";

export const LEAD_KINDS = ["contact", "quote", "consultation"] as const;
export const COMPANY_SIZES = [
  "1-5",
  "6-10",
  "11-20",
  "21-50",
  "50+",
  "non_so",
] as const;
export const BUDGET_RANGES = [
  "da_definire",
  "sotto_2k",
  "2k_5k",
  "5k_15k",
  "oltre_15k",
] as const;
export const TIMELINES = [
  "subito",
  "1_3_mesi",
  "3_6_mesi",
  "oltre_6_mesi",
  "solo_informazioni",
] as const;
export const SERVICE_INTERESTS = [
  "siti_web",
  "software",
  "digitalizzazione",
  "automazioni_ai",
  "crm",
  "non_so",
] as const;

export const leadRequestSchema = z.object({
  kind: z.enum(LEAD_KINDS).default("contact"),
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
  companySize: z.enum(COMPANY_SIZES).optional().nullable(),
  interestedService: z.enum(SERVICE_INTERESTS).optional().nullable(),
  budgetRange: z.enum(BUDGET_RANGES).optional().nullable(),
  timeline: z.enum(TIMELINES).optional().nullable(),
  howHeard: z.string().trim().max(160).optional().nullable(),
  currentTools: z.string().trim().max(500).optional().nullable(),
  message: z.string().trim().min(10).max(5000),
  privacyAccepted: z.boolean().refine((v) => v === true, {
    message: "Devi accettare la privacy policy.",
  }),
  marketingOptIn: z.boolean().default(false),
});

export type LeadRequestInput = z.infer<typeof leadRequestSchema>;
