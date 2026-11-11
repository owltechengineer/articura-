"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { extractWebsiteDomain } from "@/lib/crm/domain";
import { findDuplicateMatches } from "@/lib/crm/duplicates";
import { mapOrganizationToProspect } from "@/lib/crm/map";
import { listProspects } from "@/lib/crm/queries";
import type { DuplicateMatch, QualificationStatus } from "@/lib/crm/types";
import { QUALIFICATION_STATUSES } from "@/lib/crm/types";
import {
  prospectUpsertSchema,
  type ProspectUpsertInput,
} from "@/lib/crm/validations";
import { createClient } from "@/lib/supabase/server";

export type CrmActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
  duplicates?: DuplicateMatch[];
  imported?: number;
  skipped?: number;
  errors?: { row: number; message: string }[];
};

function revalidateCrm() {
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/clienti");
  revalidatePath("/dashboard");
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toDbPayload(data: ProspectUpsertInput, ownerId?: string) {
  const website = emptyToNull(data.website);
  return {
    legal_name: data.legalName.trim(),
    trade_name: emptyToNull(data.tradeName),
    vat_number: emptyToNull(data.vatNumber),
    email: emptyToNull(data.email),
    phone: emptyToNull(data.phone),
    website,
    website_domain: extractWebsiteDomain(website),
    sector: emptyToNull(data.sector),
    city: emptyToNull(data.city),
    province: emptyToNull(data.province),
    source: emptyToNull(data.source),
    verified_at: emptyToNull(data.verifiedAt),
    company_size_estimate: emptyToNull(data.companySizeEstimate),
    qualification_status: data.qualificationStatus,
    interested_service: emptyToNull(data.interestedService),
    commercial_priority: data.commercialPriority,
    follow_up_at: emptyToNull(data.followUpAt),
    notes: emptyToNull(data.notes),
    ...(ownerId && !data.id ? { owner_id: ownerId } : {}),
  };
}

export async function upsertProspectAction(
  input: unknown,
): Promise<CrmActionResult> {
  const user = await requireUser("crm:write");
  const parsed = prospectUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dati prospect non validi." };
  }

  const data = parsed.data;
  const existing = await listProspects({ includeClients: true });
  const duplicates = findDuplicateMatches(data, existing, {
    excludeId: data.id,
  });

  if (duplicates.length > 0 && !data.forceSaveDespiteDuplicates) {
    return {
      ok: false,
      error: "Possibili duplicati rilevati. Rivedi prima di salvare.",
      duplicates,
    };
  }

  const supabase = await createClient();
  const payload = toDbPayload(data, user.id);
  const firstDuplicate = duplicates[0];
  const duplicateGroupId = firstDuplicate?.existingId ?? null;

  let id = data.id;
  if (id) {
    const { error } = await supabase
      .from("organizations")
      .update({
        ...payload,
        ...(duplicateGroupId
          ? { duplicate_group_id: duplicateGroupId }
          : {}),
      })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: created, error } = await supabase
      .from("organizations")
      .insert({
        ...payload,
        status: "prospect",
        duplicate_group_id: duplicateGroupId,
      })
      .select("id")
      .single();
    if (error || !created) {
      return { ok: false, error: error?.message ?? "Errore salvataggio" };
    }
    id = created.id;

    if (duplicateGroupId) {
      await supabase
        .from("organizations")
        .update({ duplicate_group_id: duplicateGroupId })
        .eq("id", duplicateGroupId)
        .is("deleted_at", null);
    }
  }

  if (data.notes?.trim() && !data.id) {
    await supabase.from("organization_interactions").insert({
      organization_id: id,
      type: "note",
      summary: data.notes.trim(),
      created_by: user.id,
    });
  }

  revalidateCrm();
  return { ok: true, id, duplicates: duplicates.length ? duplicates : undefined };
}

export async function updateProspectStatusAction(
  id: string,
  status: QualificationStatus,
): Promise<CrmActionResult> {
  const user = await requireUser("crm:write");
  if (!QUALIFICATION_STATUSES.includes(status)) {
    return { ok: false, error: "Stato non valido." };
  }

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    qualification_status: status,
  };

  if (status === "won_client") {
    updates.status = "active_client";
  }

  const { error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };

  await supabase.from("organization_interactions").insert({
    organization_id: id,
    type: "status_change",
    summary: `Stato aggiornato a ${status}`,
    created_by: user.id,
  });

  revalidateCrm();
  return { ok: true, id };
}

export async function addInteractionAction(input: unknown): Promise<CrmActionResult> {
  const user = await requireUser("crm:write");
  const schema = z.object({
    organizationId: z.string().uuid(),
    summary: z.string().trim().min(2).max(2000),
    type: z.string().trim().max(40).default("note"),
    occurredAt: z.string().optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Interazione non valida." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("organization_interactions").insert({
    organization_id: parsed.data.organizationId,
    type: parsed.data.type,
    summary: parsed.data.summary,
    occurred_at: parsed.data.occurredAt || undefined,
    created_by: user.id,
  });

  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

export async function markDuplicateReviewedAction(
  id: string,
): Promise<CrmActionResult> {
  await requireUser("crm:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      duplicate_reviewed_at: new Date().toISOString(),
      duplicate_group_id: null,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true, id };
}

export async function softDeleteProspectAction(
  id: string,
): Promise<CrmActionResult> {
  await requireUser("crm:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true, id };
}

export async function convertProspectToClientAction(
  id: string,
): Promise<CrmActionResult> {
  const user = await requireUser("crm:write");
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      status: "active_client",
      qualification_status: "won_client",
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };

  await supabase.from("organization_interactions").insert({
    organization_id: id,
    type: "conversion",
    summary: "Prospect convertito in cliente attivo (stessa anagrafica).",
    created_by: user.id,
  });

  revalidateCrm();
  return { ok: true, id };
}

export async function importProspectsAction(
  rows: unknown,
): Promise<CrmActionResult> {
  const user = await requireUser("crm:write");
  const schema = z.array(prospectUpsertSchema);
  const parsed = schema.safeParse(rows);
  if (!parsed.success) {
    return { ok: false, error: "Payload import non valido." };
  }

  const existing = await listProspects({ includeClients: true });
  const supabase = await createClient();

  let imported = 0;
  let skipped = 0;
  const errors: { row: number; message: string }[] = [];
  const working = [...existing];

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    if (!row) continue;

    const duplicates = findDuplicateMatches(row, working);
    const firstDuplicate = duplicates[0];

    if (firstDuplicate && !row.forceSaveDespiteDuplicates) {
      skipped += 1;
      errors.push({
        row: i + 1,
        message: `Possibile duplicato di «${firstDuplicate.existingName}» (${firstDuplicate.reasons.join(", ")}). Saltato.`,
      });
      continue;
    }

    const payload = toDbPayload(row, user.id);
    const duplicateGroupId = firstDuplicate?.existingId ?? null;

    const { data: created, error } = await supabase
      .from("organizations")
      .insert({
        ...payload,
        status: "prospect",
        duplicate_group_id: duplicateGroupId,
      })
      .select(
        "id, legal_name, trade_name, vat_number, email, phone, website, website_domain, sector, city, province, source, verified_at, company_size_estimate, qualification_status, interested_service, commercial_priority, follow_up_at, notes, status, duplicate_group_id, created_at, updated_at",
      )
      .single();

    if (error || !created) {
      errors.push({
        row: i + 1,
        message: error?.message ?? "Errore inserimento",
      });
      continue;
    }

    working.push(mapOrganizationToProspect(created));
    imported += 1;
  }

  revalidateCrm();
  return {
    ok: true,
    imported,
    skipped,
    errors: errors.length ? errors : undefined,
  };
}

export async function checkDuplicatesAction(
  input: unknown,
): Promise<CrmActionResult> {
  await requireUser("crm:read");
  const parsed = prospectUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dati non validi." };
  }
  const existing = await listProspects({ includeClients: true });
  const duplicates = findDuplicateMatches(parsed.data, existing, {
    excludeId: parsed.data.id,
  });
  return { ok: true, duplicates };
}
