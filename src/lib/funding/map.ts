import type {
  FundingDocument,
  FundingOpportunity,
  FundingStatus,
} from "@/lib/funding/types";

type FundingRow = {
  id: string;
  name: string;
  promoter: string | null;
  region: string | null;
  territory: string | null;
  official_url: string | null;
  aid_type: string | null;
  max_contribution_eur: number | string | null;
  funding_percent: number | string | null;
  min_investment_eur: number | string | null;
  eligibility_requirements: string | null;
  opens_on: string | null;
  closes_on: string | null;
  last_verified_at: string | null;
  status: FundingStatus;
  reminder_at: string | null;
  notes: string | null;
  owner_id: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
};

type DocRow = {
  id: string;
  funding_id: string;
  title: string;
  description: string | null;
  is_required: boolean;
  is_done: boolean;
  due_on: string | null;
  storage_path: string | null;
  sort_order: number;
  completed_at: string | null;
};

function num(value: number | string | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapFunding(row: FundingRow): FundingOpportunity {
  return {
    id: row.id,
    name: row.name,
    promoter: row.promoter,
    region: row.region,
    territory: row.territory,
    officialUrl: row.official_url,
    aidType: row.aid_type,
    maxContributionEur: num(row.max_contribution_eur),
    fundingPercent: num(row.funding_percent),
    minInvestmentEur: num(row.min_investment_eur),
    eligibilityRequirements: row.eligibility_requirements,
    opensOn: row.opens_on,
    closesOn: row.closes_on,
    lastVerifiedAt: row.last_verified_at,
    status: row.status,
    reminderAt: row.reminder_at,
    notes: row.notes,
    ownerId: row.owner_id,
    organizationId: row.organization_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFundingDocument(row: DocRow): FundingDocument {
  return {
    id: row.id,
    fundingId: row.funding_id,
    title: row.title,
    description: row.description,
    isRequired: row.is_required,
    isDone: row.is_done,
    dueOn: row.due_on,
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    completedAt: row.completed_at,
  };
}
