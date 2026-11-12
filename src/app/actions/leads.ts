"use server";

import { revalidatePath } from "next/cache";

import { leadRequestSchema } from "@/lib/leads/validations";
import { createClient } from "@/lib/supabase/server";

export type LeadActionResult = {
  ok: boolean;
  error?: string;
  requestNumber?: string;
};

function buildRequestNumber(kind: string) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  const prefix = kind === "quote" ? "PREV" : kind === "consultation" ? "CONS" : "CNT";
  return `${prefix}-${stamp}-${rand}`;
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function submitLeadRequestAction(
  input: unknown,
): Promise<LeadActionResult> {
  const parsed = leadRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Controlla i campi e riprova.",
    };
  }

  const data = parsed.data;
  if (!data.privacyAccepted) {
    return { ok: false, error: "Devi accettare la privacy policy." };
  }
  // Public email ≠ marketing consent
  if (data.marketingOptIn !== true && data.marketingOptIn !== false) {
    return { ok: false, error: "Consenso marketing non valido." };
  }

  const supabase = await createClient();
  const requestNumber = buildRequestNumber(data.kind);

  let organizationId: string | null = null;
  const { data: org } = await supabase
    .from("organizations")
    .insert({
      legal_name: data.companyName,
      email: data.contactEmail,
      phone: emptyToNull(data.contactPhone),
      website: emptyToNull(data.website),
      vat_number: emptyToNull(data.vatNumber),
      city: emptyToNull(data.city),
      province: emptyToNull(data.province),
      sector: emptyToNull(data.sector),
      company_size_estimate: data.companySize ?? null,
      interested_service: data.interestedService ?? null,
      source: emptyToNull(data.howHeard) ?? `form_${data.kind}`,
      qualification_status: "new",
      status: "prospect",
      notes: [
        `Lead ${requestNumber}`,
        data.contactRole ? `Ruolo: ${data.contactRole}` : null,
        data.budgetRange ? `Budget: ${data.budgetRange}` : null,
        data.timeline ? `Tempistiche: ${data.timeline}` : null,
        data.currentTools ? `Strumenti attuali: ${data.currentTools}` : null,
        data.message,
        data.marketingOptIn
          ? "Marketing opt-in: sì (esplicito)"
          : "Marketing opt-in: no",
      ]
        .filter(Boolean)
        .join("\n"),
    })
    .select("id")
    .maybeSingle();
  organizationId = org?.id ?? null;

  const { error } = await supabase.from("lead_requests").insert({
    request_number: requestNumber,
    kind: data.kind,
    contact_name: data.contactName,
    contact_email: data.contactEmail,
    contact_phone: emptyToNull(data.contactPhone),
    contact_role: emptyToNull(data.contactRole),
    company_name: data.companyName,
    vat_number: emptyToNull(data.vatNumber),
    website: emptyToNull(data.website),
    city: emptyToNull(data.city),
    province: emptyToNull(data.province),
    sector: emptyToNull(data.sector),
    company_size: data.companySize ?? null,
    interested_service: data.interestedService ?? null,
    budget_range: data.budgetRange ?? null,
    timeline: data.timeline ?? null,
    how_heard: emptyToNull(data.howHeard),
    current_tools: emptyToNull(data.currentTools),
    message: data.message,
    privacy_accepted: true,
    marketing_opt_in: data.marketingOptIn === true,
    organization_id: organizationId,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes("lead_requests") || error.code === "42P01"
          ? "Esegui APPLY_NOW_leads.sql su Supabase, poi riprova."
          : error.message,
    };
  }

  if (organizationId) {
    await supabase.from("organization_interactions").insert({
      organization_id: organizationId,
      type: "lead_form",
      summary: `Richiesta ${requestNumber} inviata dal sito (${data.kind}).`,
    });
  }

  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/preventivi");
  return { ok: true, requestNumber };
}
