import "server-only";

import { mapFunding, mapFundingDocument } from "@/lib/funding/map";
import type { FundingDocument, FundingOpportunity } from "@/lib/funding/types";
import { createClient } from "@/lib/supabase/server";

const FUNDING_SELECT = `
  id, name, promoter, region, territory, official_url, aid_type,
  max_contribution_eur, funding_percent, min_investment_eur,
  eligibility_requirements, opens_on, closes_on, last_verified_at, status,
  reminder_at, notes, owner_id, organization_id, created_at, updated_at
`;

const DOC_SELECT = `
  id, funding_id, title, description, is_required, is_done, due_on,
  storage_path, sort_order, completed_at
`;

export async function listFundingOpportunities(): Promise<FundingOpportunity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("funding_opportunities")
    .select(FUNDING_SELECT)
    .is("deleted_at", null)
    .order("closes_on", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFunding);
}

export async function getFundingOpportunity(
  id: string,
): Promise<FundingOpportunity | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("funding_opportunities")
    .select(FUNDING_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapFunding(data) : null;
}

export async function listFundingDocuments(
  fundingId: string,
): Promise<FundingDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("funding_documents")
    .select(DOC_SELECT)
    .eq("funding_id", fundingId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFundingDocument);
}

export async function listTasksForFunding(fundingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, progress_percent")
    .eq("funding_id", fundingId)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
