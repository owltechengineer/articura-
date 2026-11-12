"use server";

import { revalidatePath } from "next/cache";

import { calculateQuote, PricingError } from "@/lib/pricing/engine";
import { loadCatalogSnapshot } from "@/lib/pricing/catalog";
import { submitQuoteRequestSchema } from "@/lib/pricing/validations";
import { createClient } from "@/lib/supabase/server";

export type SubmitQuoteResult = {
  ok: boolean;
  error?: string;
  requestNumber?: string;
  pricing?: {
    totalOneTimeCents: number;
    totalRecurringMonthlyCents: number;
    totalRecurringYearlyCents: number;
    hasOnRequestItems: boolean;
  };
};

function buildRequestNumber() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `REQ-${stamp}-${rand}`;
}

export async function previewQuoteAction(
  selectionRaw: unknown,
): Promise<SubmitQuoteResult & { lines?: unknown }> {
  const parsed = submitQuoteRequestSchema.shape.selection.safeParse(selectionRaw);
  if (!parsed.success) {
    return { ok: false, error: "Selezione non valida." };
  }

  const catalog = await loadCatalogSnapshot({ includeDrafts: false });
  if (!catalog) {
    return { ok: false, error: "Listino non disponibile." };
  }

  try {
    const pricing = calculateQuote(catalog, parsed.data);
    return {
      ok: true,
      pricing: {
        totalOneTimeCents: pricing.totalOneTimeCents,
        totalRecurringMonthlyCents: pricing.totalRecurringMonthlyCents,
        totalRecurringYearlyCents: pricing.totalRecurringYearlyCents,
        hasOnRequestItems: pricing.hasOnRequestItems,
      },
      lines: pricing.lines,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof PricingError ? error.message : "Errore di calcolo.",
    };
  }
}

export async function submitQuoteRequestAction(
  input: unknown,
): Promise<SubmitQuoteResult> {
  const parsed = submitQuoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Controlla i dati del form e riprova." };
  }

  const catalog = await loadCatalogSnapshot({ includeDrafts: false });
  if (!catalog) {
    return {
      ok: false,
      error:
        "Il listino non è ancora collegato. Configura Supabase e pubblica i servizi.",
    };
  }

  let pricing;
  try {
    pricing = calculateQuote(catalog, parsed.data.selection);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof PricingError ? error.message : "Errore di calcolo.",
    };
  }

  if (!parsed.data.contact.privacyAccepted) {
    return { ok: false, error: "Devi accettare la privacy policy." };
  }

  const supabase = await createClient();
  const requestNumber = buildRequestNumber();
  const contact = parsed.data.contact;
  const emptyToNull = (value: string | null | undefined) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  };

  // Create/find prospect organization (best-effort, non blocking on failure)
  let organizationId: string | null = null;
  let opportunityId: string | null = null;

  const { data: org } = await supabase
    .from("organizations")
    .insert({
      legal_name: contact.companyName,
      email: contact.contactEmail,
      phone: emptyToNull(contact.contactPhone),
      website: emptyToNull(contact.website),
      vat_number: emptyToNull(contact.vatNumber),
      city: emptyToNull(contact.city),
      province: emptyToNull(contact.province),
      sector: emptyToNull(contact.sector),
      company_size_estimate: contact.companySize ?? null,
      source: "configurator",
      qualification_status: "new",
      status: "prospect",
      notes: [
        `Lead da configuratore ${requestNumber}`,
        contact.contactRole ? `Ruolo: ${contact.contactRole}` : null,
        contact.timeline ? `Tempistiche: ${contact.timeline}` : null,
        contact.currentTools
          ? `Strumenti attuali: ${contact.currentTools}`
          : null,
        contact.notes,
        contact.marketingOptIn
          ? "Marketing opt-in: sì (esplicito)"
          : "Marketing opt-in: no",
      ]
        .filter(Boolean)
        .join("\n"),
    })
    .select("id")
    .maybeSingle();
  organizationId = org?.id ?? null;

  if (organizationId) {
    const { data: opportunity } = await supabase
      .from("opportunities")
      .insert({
        organization_id: organizationId,
        title: `Richiesta ${requestNumber}`,
        stage: "quote_sent",
        estimated_value: pricing.hasOnRequestItems
          ? null
          : pricing.totalOneTimeCents / 100,
        notes: contact.notes,
      })
      .select("id")
      .maybeSingle();
    opportunityId = opportunity?.id ?? null;

    await supabase.from("organization_interactions").insert({
      organization_id: organizationId,
      type: "quote_request",
      summary: `Preventivo ${requestNumber} inviato dal configuratore.`,
    });
  }

  const contactDetails = {
    contactRole: emptyToNull(contact.contactRole),
    vatNumber: emptyToNull(contact.vatNumber),
    website: emptyToNull(contact.website),
    city: emptyToNull(contact.city),
    province: emptyToNull(contact.province),
    sector: emptyToNull(contact.sector),
    companySize: contact.companySize ?? null,
    timeline: contact.timeline ?? null,
    currentTools: emptyToNull(contact.currentTools),
    privacyAccepted: true,
    marketingOptIn: contact.marketingOptIn === true,
  };

  const { data: request, error } = await supabase
    .from("quote_requests")
    .insert({
      request_number: requestNumber,
      contact_name: contact.contactName,
      contact_email: contact.contactEmail,
      contact_phone: emptyToNull(contact.contactPhone),
      company_name: contact.companyName,
      notes: emptyToNull(contact.notes),
      contact_details: contactDetails,
      selection: parsed.data.selection,
      pricing_snapshot: {
        catalogVersion: catalog.version,
        result: pricing,
        frozenAt: new Date().toISOString(),
      },
      list_version: pricing.listVersion,
      subtotal_one_time_cents: pricing.subtotalOneTimeCents,
      discount_cents: pricing.discountCents,
      tax_rate: pricing.taxRate,
      tax_cents: pricing.taxCents,
      total_one_time_cents: pricing.totalOneTimeCents,
      total_recurring_monthly_cents: pricing.totalRecurringMonthlyCents,
      total_recurring_yearly_cents: pricing.totalRecurringYearlyCents,
      has_on_request_items: pricing.hasOnRequestItems,
      organization_id: organizationId,
      opportunity_id: opportunityId,
    })
    .select("id")
    .single();

  if (error || !request) {
    return {
      ok: false,
      error:
        error?.message?.includes("contact_details") || error?.code === "42703"
          ? "Esegui APPLY_NOW_leads.sql su Supabase, poi riprova."
          : (error?.message ?? "Impossibile salvare la richiesta."),
    };
  }

  const items = pricing.lines
    .filter((line) => line.itemType !== "tax")
    .map((line, index) => ({
      quote_request_id: request.id,
      item_type: line.itemType,
      ref_id: line.refId,
      name: line.name,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
      line_total_cents: line.lineTotalCents,
      recurring_price_cents: line.recurringPriceCents,
      recurring_period: line.recurringPeriod,
      price_kind: line.priceKind,
      sort_order: index,
      meta: {},
    }));

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from("quote_request_items")
      .insert(items);
    if (itemsError) {
      return { ok: false, error: itemsError.message };
    }
  }

  revalidatePath("/dashboard/preventivi");
  revalidatePath("/dashboard/crm");

  return {
    ok: true,
    requestNumber,
    pricing: {
      totalOneTimeCents: pricing.totalOneTimeCents,
      totalRecurringMonthlyCents: pricing.totalRecurringMonthlyCents,
      totalRecurringYearlyCents: pricing.totalRecurringYearlyCents,
      hasOnRequestItems: pricing.hasOnRequestItems,
    },
  };
}
