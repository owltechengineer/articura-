import "server-only";

import { mapCampaign, mapSocialContent } from "@/lib/social/map";
import type { MarketingCampaign, SocialContent } from "@/lib/social/types";
import { createClient } from "@/lib/supabase/server";

const CAMPAIGN_SELECT =
  "id, name, description, starts_on, ends_on, status, owner_id, notes";

const CONTENT_SELECT = `
  id, title, description, body, platform, content_type, status, scheduled_for,
  published_at, campaign_id, organization_id, objective_id, is_template,
  is_idea_archive, attachments, notes, created_by, owner_id, created_at, updated_at
`;

export async function listCampaigns(): Promise<MarketingCampaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select(CAMPAIGN_SELECT)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCampaign);
}

export async function listSocialContents(options?: {
  from?: string;
  to?: string;
  templatesOnly?: boolean;
  ideasOnly?: boolean;
  includeArchiveFlags?: boolean;
}): Promise<SocialContent[]> {
  const supabase = await createClient();
  let q = supabase
    .from("social_contents")
    .select(CONTENT_SELECT)
    .is("deleted_at", null)
    .order("scheduled_for", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (options?.templatesOnly) {
    q = q.eq("is_template", true);
  } else if (options?.ideasOnly) {
    q = q.eq("is_idea_archive", true);
  } else if (!options?.includeArchiveFlags) {
    q = q.eq("is_template", false).eq("is_idea_archive", false);
  }

  if (options?.from) {
    q = q.gte("scheduled_for", options.from);
  }
  if (options?.to) {
    q = q.lte("scheduled_for", options.to);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSocialContent);
}
