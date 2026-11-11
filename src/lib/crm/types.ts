export const QUALIFICATION_STATUSES = [
  "new",
  "to_verify",
  "qualified",
  "contacted",
  "interested",
  "demo_scheduled",
  "quote_sent",
  "won_client",
  "not_interested",
] as const;

export type QualificationStatus = (typeof QUALIFICATION_STATUSES)[number];

export const QUALIFICATION_LABELS: Record<QualificationStatus, string> = {
  new: "Nuovo",
  to_verify: "Da verificare",
  qualified: "Qualificato",
  contacted: "Contattato",
  interested: "Interessato",
  demo_scheduled: "Demo programmata",
  quote_sent: "Preventivo inviato",
  won_client: "Cliente acquisito",
  not_interested: "Non interessato",
};

export const COMMERCIAL_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type CommercialPriority = (typeof COMMERCIAL_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<CommercialPriority, string> = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export type ProspectRecord = {
  id: string;
  legalName: string;
  tradeName: string | null;
  vatNumber: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  websiteDomain: string | null;
  sector: string | null;
  city: string | null;
  province: string | null;
  source: string | null;
  verifiedAt: string | null;
  companySizeEstimate: string | null;
  qualificationStatus: QualificationStatus;
  interestedService: string | null;
  commercialPriority: CommercialPriority;
  followUpAt: string | null;
  notes: string | null;
  status: "prospect" | "active_client" | "former_client";
  duplicateGroupId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProspectInput = {
  id?: string;
  legalName: string;
  tradeName?: string | null;
  vatNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  sector?: string | null;
  city?: string | null;
  province?: string | null;
  source?: string | null;
  verifiedAt?: string | null;
  companySizeEstimate?: string | null;
  qualificationStatus?: QualificationStatus;
  interestedService?: string | null;
  commercialPriority?: CommercialPriority;
  followUpAt?: string | null;
  notes?: string | null;
};

export type DuplicateMatch = {
  existingId: string;
  existingName: string;
  reasons: string[];
};
