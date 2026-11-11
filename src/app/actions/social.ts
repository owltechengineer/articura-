"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import {
  campaignUpsertSchema,
  socialContentUpsertSchema,
} from "@/lib/social/validations";
import { createClient } from "@/lib/supabase/server";

export type SocialActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
  path?: string;
};

function revalidateSocial() {
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/calendario");
  revalidatePath("/dashboard");
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function upsertCampaignAction(
  input: unknown,
): Promise<SocialActionResult> {
  await requireUser("documents:write");
  const parsed = campaignUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Campagna non valida." };

  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    name: data.name,
    description: emptyToNull(data.description),
    starts_on: emptyToNull(data.startsOn),
    ends_on: emptyToNull(data.endsOn),
    status: data.status,
    owner_id: data.ownerId ?? null,
    notes: emptyToNull(data.notes),
  };

  if (data.id) {
    const { error } = await supabase
      .from("marketing_campaigns")
      .update(payload)
      .eq("id", data.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    revalidateSocial();
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("marketing_campaigns")
    .insert(payload)
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? "Errore salvataggio" };
  }
  revalidateSocial();
  return { ok: true, id: created.id };
}

export async function softDeleteCampaignAction(
  id: string,
): Promise<SocialActionResult> {
  await requireUser("documents:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_campaigns")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateSocial();
  return { ok: true, id };
}

export async function upsertSocialContentAction(
  input: unknown,
): Promise<SocialActionResult> {
  const user = await requireUser("documents:write");
  const parsed = socialContentUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Contenuto non valido.",
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  let publishedAt = emptyToNull(data.publishedAt);
  if (data.status === "published" && !publishedAt) {
    publishedAt = emptyToNull(data.scheduledFor) ?? new Date().toISOString();
  }
  if (data.status !== "published") {
    publishedAt = null;
  }

  const payload = {
    title: data.title,
    description: emptyToNull(data.description),
    body: emptyToNull(data.body),
    platform: data.platform,
    content_type: data.contentType,
    status: data.status,
    scheduled_for: emptyToNull(data.scheduledFor),
    published_at: publishedAt,
    campaign_id: data.campaignId ?? null,
    organization_id: data.organizationId ?? null,
    objective_id: data.objectiveId ?? null,
    is_template: data.isTemplate,
    is_idea_archive: data.isIdeaArchive,
    attachments: data.attachments,
    notes: emptyToNull(data.notes),
    owner_id: data.ownerId ?? null,
  };

  if (data.id) {
    const { error } = await supabase
      .from("social_contents")
      .update(payload)
      .eq("id", data.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    revalidateSocial();
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("social_contents")
    .insert({ ...payload, created_by: user.id })
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? "Errore salvataggio" };
  }
  revalidateSocial();
  return { ok: true, id: created.id };
}

export async function softDeleteSocialContentAction(
  id: string,
): Promise<SocialActionResult> {
  await requireUser("documents:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_contents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateSocial();
  return { ok: true, id };
}

export async function uploadSocialAttachmentAction(
  formData: FormData,
): Promise<SocialActionResult> {
  await requireUser("documents:write");
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "File mancante." };
  }
  if (file.size > 25 * 1024 * 1024) {
    return { ok: false, error: "File troppo grande (max 25MB)." };
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ];
  if (file.type && !allowed.includes(file.type)) {
    return { ok: false, error: "Formato non supportato (immagini/video)." };
  }

  const supabase = await createClient();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `marketing/social/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("documents")
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) return { ok: false, error: error.message };
  return { ok: true, path };
}
