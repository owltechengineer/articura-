import type {
  MarketingCampaign,
  SocialAttachment,
  SocialContent,
  SocialContentStatus,
  SocialContentType,
  SocialPlatform,
} from "@/lib/social/types";

type CampaignRow = {
  id: string;
  name: string;
  description: string | null;
  starts_on: string | null;
  ends_on: string | null;
  status: string;
  owner_id: string | null;
  notes: string | null;
};

type ContentRow = {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  platform: SocialPlatform;
  content_type: SocialContentType;
  status: SocialContentStatus;
  scheduled_for: string | null;
  published_at: string | null;
  campaign_id: string | null;
  organization_id: string | null;
  objective_id: string | null;
  is_template: boolean;
  is_idea_archive: boolean;
  attachments: unknown;
  notes: string | null;
  created_by: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapAttachments(value: unknown): SocialAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        name: String(row.name ?? ""),
        path: String(row.path ?? ""),
        mimeType: (row.mimeType as string | null | undefined) ?? null,
        sizeBytes:
          typeof row.sizeBytes === "number" ? row.sizeBytes : null,
      };
    })
    .filter((a) => a.name && a.path);
}

export function mapCampaign(row: CampaignRow): MarketingCampaign {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    status: row.status,
    ownerId: row.owner_id,
    notes: row.notes,
  };
}

export function mapSocialContent(row: ContentRow): SocialContent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    body: row.body,
    platform: row.platform,
    contentType: row.content_type,
    status: row.status,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    campaignId: row.campaign_id,
    organizationId: row.organization_id,
    objectiveId: row.objective_id,
    isTemplate: row.is_template,
    isIdeaArchive: row.is_idea_archive,
    attachments: mapAttachments(row.attachments),
    notes: row.notes,
    createdBy: row.created_by,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
