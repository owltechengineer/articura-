export const FUNDING_STATUSES = [
  "to_verify",
  "to_evaluate",
  "eligibility_check",
  "in_preparation",
  "submitted",
  "approved",
  "rejected",
  "closed",
] as const;

export type FundingStatus = (typeof FUNDING_STATUSES)[number];

export const FUNDING_STATUS_LABELS: Record<FundingStatus, string> = {
  to_verify: "Da verificare",
  to_evaluate: "Da valutare",
  eligibility_check: "Idoneità da verificare",
  in_preparation: "In preparazione",
  submitted: "Presentato",
  approved: "Approvato",
  rejected: "Respinto",
  closed: "Chiuso",
};

export type FundingOpportunity = {
  id: string;
  name: string;
  promoter: string | null;
  region: string | null;
  territory: string | null;
  officialUrl: string | null;
  aidType: string | null;
  maxContributionEur: number | null;
  fundingPercent: number | null;
  minInvestmentEur: number | null;
  eligibilityRequirements: string | null;
  opensOn: string | null;
  closesOn: string | null;
  lastVerifiedAt: string | null;
  status: FundingStatus;
  reminderAt: string | null;
  notes: string | null;
  ownerId: string | null;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FundingDocument = {
  id: string;
  fundingId: string;
  title: string;
  description: string | null;
  isRequired: boolean;
  isDone: boolean;
  dueOn: string | null;
  storagePath: string | null;
  sortOrder: number;
  completedAt: string | null;
};

/** A bando is never shown as "open" without a recent official verification. */
export function isOfficiallyVerifiedOpen(
  item: Pick<
    FundingOpportunity,
    "status" | "opensOn" | "closesOn" | "lastVerifiedAt" | "officialUrl"
  >,
  options?: { maxAgeDays?: number; today?: Date },
): { open: boolean; reason: string } {
  const maxAgeDays = options?.maxAgeDays ?? 14;
  const today = options?.today ?? new Date();

  if (
    item.status === "closed" ||
    item.status === "rejected" ||
    item.status === "approved"
  ) {
    return { open: false, reason: "Stato non aperto" };
  }
  if (!item.officialUrl?.trim()) {
    return { open: false, reason: "Manca URL ufficiale" };
  }
  if (!item.lastVerifiedAt) {
    return { open: false, reason: "Manca data ultima verifica su fonte ufficiale" };
  }

  const verified = new Date(`${item.lastVerifiedAt}T12:00:00`);
  if (Number.isNaN(verified.getTime())) {
    return { open: false, reason: "Data verifica non valida" };
  }

  const ageMs = today.getTime() - verified.getTime();
  if (ageMs > maxAgeDays * 24 * 60 * 60 * 1000) {
    return {
      open: false,
      reason: `Verifica ufficiale più vecchia di ${maxAgeDays} giorni`,
    };
  }

  if (item.opensOn) {
    const opens = new Date(`${item.opensOn}T00:00:00`);
    if (today < opens) {
      return { open: false, reason: "Non ancora aperto secondo le date registrate" };
    }
  }
  if (item.closesOn) {
    const closes = new Date(`${item.closesOn}T23:59:59`);
    if (today > closes) {
      return { open: false, reason: "Scaduto secondo le date registrate" };
    }
  }

  return {
    open: true,
    reason: "Verificato su fonte ufficiale entro la finestra consentita",
  };
}
