"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import {
  fundingDocumentUpsertSchema,
  fundingUpsertSchema,
} from "@/lib/funding/validations";
import { createClient } from "@/lib/supabase/server";

export type FundingActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
};

function revalidateFunding(id?: string) {
  revalidatePath("/dashboard/bandi");
  revalidatePath("/dashboard/attivita");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/dashboard/bandi/${id}`);
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function upsertFundingAction(
  input: unknown,
): Promise<FundingActionResult> {
  const user = await requireUser("projects:write");
  const parsed = fundingUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Bando non valido.",
    };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    name: data.name,
    promoter: emptyToNull(data.promoter),
    region: emptyToNull(data.region),
    territory: emptyToNull(data.territory),
    official_url: emptyToNull(data.officialUrl),
    aid_type: emptyToNull(data.aidType),
    max_contribution_eur: data.maxContributionEur ?? null,
    funding_percent: data.fundingPercent ?? null,
    min_investment_eur: data.minInvestmentEur ?? null,
    eligibility_requirements: emptyToNull(data.eligibilityRequirements),
    opens_on: emptyToNull(data.opensOn),
    closes_on: emptyToNull(data.closesOn),
    last_verified_at: emptyToNull(data.lastVerifiedAt),
    status: data.status,
    reminder_at: emptyToNull(data.reminderAt),
    notes: emptyToNull(data.notes),
    owner_id: data.ownerId ?? null,
    organization_id: data.organizationId ?? null,
  };

  if (data.id) {
    const { error } = await supabase
      .from("funding_opportunities")
      .update(payload)
      .eq("id", data.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    revalidateFunding(data.id);
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("funding_opportunities")
    .insert({ ...payload, created_by: user.id })
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? "Errore salvataggio" };
  }
  revalidateFunding(created.id);
  return { ok: true, id: created.id };
}

export async function softDeleteFundingAction(
  id: string,
): Promise<FundingActionResult> {
  await requireUser("projects:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("funding_opportunities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateFunding(id);
  return { ok: true, id };
}

export async function upsertFundingDocumentAction(
  input: unknown,
): Promise<FundingActionResult> {
  await requireUser("projects:write");
  const parsed = fundingDocumentUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Documento non valido." };

  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    funding_id: data.fundingId,
    title: data.title,
    description: emptyToNull(data.description),
    is_required: data.isRequired,
    is_done: data.isDone,
    due_on: emptyToNull(data.dueOn),
    storage_path: emptyToNull(data.storagePath),
    sort_order: data.sortOrder,
    completed_at: data.isDone ? new Date().toISOString() : null,
  };

  if (data.id) {
    const { error } = await supabase
      .from("funding_documents")
      .update(payload)
      .eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    revalidateFunding(data.fundingId);
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("funding_documents")
    .insert(payload)
    .select("id")
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? "Errore salvataggio" };
  }
  revalidateFunding(data.fundingId);
  return { ok: true, id: created.id };
}

export async function toggleFundingDocumentDoneAction(
  id: string,
  fundingId: string,
  isDone: boolean,
): Promise<FundingActionResult> {
  await requireUser("projects:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("funding_documents")
    .update({
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateFunding(fundingId);
  return { ok: true, id };
}

export async function deleteFundingDocumentAction(
  id: string,
  fundingId: string,
): Promise<FundingActionResult> {
  await requireUser("projects:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("funding_documents")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateFunding(fundingId);
  return { ok: true, id };
}

export async function linkTaskToFundingAction(input: {
  taskId: string;
  fundingId: string | null;
}): Promise<FundingActionResult> {
  await requireUser("projects:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ funding_id: input.fundingId })
    .eq("id", input.taskId)
    .is("deleted_at", null);
  if (error) return { ok: false, error: error.message };
  revalidateFunding(input.fundingId ?? undefined);
  return { ok: true, id: input.taskId };
}
