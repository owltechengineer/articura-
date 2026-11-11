import "server-only";

import { mapOrganizationToProspect } from "@/lib/crm/map";
import type { ProspectRecord } from "@/lib/crm/types";
import { createClient } from "@/lib/supabase/server";

const PROSPECT_SELECT = `
  id, legal_name, trade_name, vat_number, email, phone, website, website_domain,
  sector, city, province, source, verified_at, company_size_estimate,
  qualification_status, interested_service, commercial_priority, follow_up_at,
  notes, status, duplicate_group_id, created_at, updated_at
`;

export async function listProspects(options?: {
  includeClients?: boolean;
  query?: string;
}): Promise<ProspectRecord[]> {
  const supabase = await createClient();
  let q = supabase
    .from("organizations")
    .select(PROSPECT_SELECT)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (!options?.includeClients) {
    q = q.eq("status", "prospect");
  }

  if (options?.query?.trim()) {
    const term = `%${options.query.trim()}%`;
    q = q.or(
      `legal_name.ilike.${term},trade_name.ilike.${term},email.ilike.${term},city.ilike.${term},vat_number.ilike.${term}`,
    );
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrganizationToProspect);
}

export async function getProspect(id: string): Promise<ProspectRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(PROSPECT_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapOrganizationToProspect(data) : null;
}

export async function listInteractions(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_interactions")
    .select("id, type, summary, occurred_at, created_by, created_at")
    .eq("organization_id", organizationId)
    .order("occurred_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPotentialDuplicates(): Promise<ProspectRecord[]> {
  const all = await listProspects({ includeClients: true });
  return all.filter((p) => p.duplicateGroupId != null);
}
