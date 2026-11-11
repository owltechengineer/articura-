export const SOCIAL_PLATFORMS = [
  "linkedin",
  "instagram",
  "facebook",
  "tiktok",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export const SOCIAL_CONTENT_STATUSES = [
  "idea",
  "to_produce",
  "in_review",
  "scheduled",
  "published",
] as const;
export type SocialContentStatus = (typeof SOCIAL_CONTENT_STATUSES)[number];

export const SOCIAL_STATUS_LABELS: Record<SocialContentStatus, string> = {
  idea: "Idea",
  to_produce: "Da produrre",
  in_review: "In revisione",
  scheduled: "Programmato",
  published: "Pubblicato",
};

export const SOCIAL_CONTENT_TYPES = [
  "reel",
  "carousel",
  "post",
  "case_study",
] as const;
export type SocialContentType = (typeof SOCIAL_CONTENT_TYPES)[number];

export const SOCIAL_TYPE_LABELS: Record<SocialContentType, string> = {
  reel: "Reel",
  carousel: "Carosello",
  post: "Post",
  case_study: "Case study",
};

export type SocialAttachment = {
  name: string;
  path: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
};

export type MarketingCampaign = {
  id: string;
  name: string;
  description: string | null;
  startsOn: string | null;
  endsOn: string | null;
  status: string;
  ownerId: string | null;
  notes: string | null;
};

export type SocialContent = {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  platform: SocialPlatform;
  contentType: SocialContentType;
  status: SocialContentStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
  campaignId: string | null;
  organizationId: string | null;
  objectiveId: string | null;
  isTemplate: boolean;
  isIdeaArchive: boolean;
  attachments: SocialAttachment[];
  notes: string | null;
  createdBy: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
};
