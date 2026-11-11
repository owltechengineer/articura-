"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { eurosToCents } from "@/lib/pricing/money";
import { loadCatalogSnapshot } from "@/lib/pricing/catalog";
import {
  addonUpsertSchema,
  packageUpsertSchema,
  promotionUpsertSchema,
  serviceUpsertSchema,
} from "@/lib/pricing/validations";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
};

async function requireAdmin() {
  return requireUser("settings:write");
}

function revalidateCatalog() {
  revalidatePath("/servizi");
  revalidatePath("/dashboard/preventivi");
  revalidatePath("/dashboard/preventivi/configurazione");
  revalidatePath("/servizi/anteprima");
}

export async function upsertServiceAction(
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = serviceUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dati servizio non validi." };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    category_id: data.categoryId,
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    features: data.features,
    price_kind: data.priceKind,
    base_price_cents:
      data.basePriceEuros == null ? null : eurosToCents(data.basePriceEuros),
    recurring_price_cents:
      data.recurringPriceEuros == null
        ? null
        : eurosToCents(data.recurringPriceEuros),
    recurring_period: data.recurringPeriod,
    is_available_in_configurator: data.isAvailableInConfigurator,
    status: data.status,
    sort_order: data.sortOrder,
    is_active: data.isActive,
  };

  let serviceId = data.id;
  if (serviceId) {
    const { error } = await supabase
      .from("catalog_services")
      .update(payload)
      .eq("id", serviceId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: created, error } = await supabase
      .from("catalog_services")
      .insert(payload)
      .select("id")
      .single();
    if (error || !created) return { ok: false, error: error?.message ?? "Errore" };
    serviceId = created.id;
  }

  await supabase.from("catalog_service_addons").delete().eq("service_id", serviceId);
  if (data.addonIds.length > 0) {
    const { error } = await supabase.from("catalog_service_addons").insert(
      data.addonIds.map((addonId) => ({
        service_id: serviceId!,
        addon_id: addonId,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, id: serviceId };
}

export async function duplicateServiceAction(
  serviceId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: service, error } = await supabase
    .from("catalog_services")
    .select("*")
    .eq("id", serviceId)
    .maybeSingle();
  if (error || !service) return { ok: false, error: "Servizio non trovato." };

  const { data: links } = await supabase
    .from("catalog_service_addons")
    .select("addon_id")
    .eq("service_id", serviceId);

  const slug = `${service.slug}-copia-${Date.now().toString(36)}`;
  const { data: created, error: insertError } = await supabase
    .from("catalog_services")
    .insert({
      category_id: service.category_id,
      slug,
      name: `${service.name} (copia)`,
      description: service.description,
      features: service.features,
      price_kind: service.price_kind,
      base_price_cents: service.base_price_cents,
      recurring_price_cents: service.recurring_price_cents,
      recurring_period: service.recurring_period,
      is_available_in_configurator: false,
      status: "draft",
      sort_order: service.sort_order + 1,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    return { ok: false, error: insertError?.message ?? "Errore duplicazione" };
  }

  if (links && links.length > 0) {
    await supabase.from("catalog_service_addons").insert(
      links.map((link) => ({
        service_id: created.id,
        addon_id: link.addon_id,
      })),
    );
  }

  revalidateCatalog();
  return { ok: true, id: created.id };
}

export async function softDeleteServiceAction(
  serviceId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_services")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      status: "draft",
      is_available_in_configurator: false,
    })
    .eq("id", serviceId);
  if (error) return { ok: false, error: error.message };
  revalidateCatalog();
  return { ok: true, id: serviceId };
}

export async function upsertAddonAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = addonUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dati opzione non validi." };
  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    price_kind: data.priceKind,
    unit_price_cents:
      data.unitPriceEuros == null ? null : eurosToCents(data.unitPriceEuros),
    recurring_price_cents:
      data.recurringPriceEuros == null
        ? null
        : eurosToCents(data.recurringPriceEuros),
    recurring_period: data.recurringPeriod,
    min_qty: data.minQty,
    max_qty: data.maxQty ?? null,
    depends_on_addon_ids: data.dependsOnAddonIds,
    incompatible_addon_ids: data.incompatibleAddonIds,
    status: data.status,
    sort_order: data.sortOrder,
    is_active: data.isActive,
  };

  if (data.id) {
    const { error } = await supabase
      .from("catalog_addons")
      .update(payload)
      .eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    revalidateCatalog();
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("catalog_addons")
    .insert(payload)
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Errore" };
  revalidateCatalog();
  return { ok: true, id: created.id };
}

export async function softDeleteAddonAction(
  addonId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_addons")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      status: "draft",
    })
    .eq("id", addonId);
  if (error) return { ok: false, error: error.message };
  revalidateCatalog();
  return { ok: true, id: addonId };
}

export async function upsertPackageAction(
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = packageUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dati pacchetto non validi." };
  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    features: data.features,
    price_kind: data.priceKind,
    package_price_cents:
      data.packagePriceEuros == null
        ? null
        : eurosToCents(data.packagePriceEuros),
    recurring_price_cents:
      data.recurringPriceEuros == null
        ? null
        : eurosToCents(data.recurringPriceEuros),
    recurring_period: data.recurringPeriod,
    is_available_in_configurator: data.isAvailableInConfigurator,
    status: data.status,
    sort_order: data.sortOrder,
    is_active: data.isActive,
  };

  let packageId = data.id;
  if (packageId) {
    const { error } = await supabase
      .from("catalog_packages")
      .update(payload)
      .eq("id", packageId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: created, error } = await supabase
      .from("catalog_packages")
      .insert(payload)
      .select("id")
      .single();
    if (error || !created) return { ok: false, error: error?.message ?? "Errore" };
    packageId = created.id;
  }

  await supabase.from("catalog_package_items").delete().eq("package_id", packageId);
  if (data.serviceIds.length > 0) {
    const { error } = await supabase.from("catalog_package_items").insert(
      data.serviceIds.map((serviceId, index) => ({
        package_id: packageId!,
        service_id: serviceId,
        sort_order: index,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidateCatalog();
  return { ok: true, id: packageId };
}

export async function softDeletePackageAction(
  packageId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_packages")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      status: "draft",
      is_available_in_configurator: false,
    })
    .eq("id", packageId);
  if (error) return { ok: false, error: error.message };
  revalidateCatalog();
  return { ok: true, id: packageId };
}

export async function upsertPromotionAction(
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = promotionUpsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dati promozione non validi." };
  const data = parsed.data;
  const supabase = await createClient();
  const payload = {
    code: data.code?.trim() ? data.code.trim().toUpperCase() : null,
    name: data.name,
    kind: data.kind,
    percent_off: data.percentOff ?? null,
    amount_off_cents:
      data.amountOffEuros == null ? null : eurosToCents(data.amountOffEuros),
    package_id: data.packageId ?? null,
    promo_package_price_cents:
      data.promoPackagePriceEuros == null
        ? null
        : eurosToCents(data.promoPackagePriceEuros),
    starts_at: data.startsAt ?? null,
    ends_at: data.endsAt ?? null,
    is_active: data.isActive,
    stackable: data.stackable,
  };

  if (data.id) {
    const { error } = await supabase
      .from("catalog_promotions")
      .update(payload)
      .eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    revalidateCatalog();
    return { ok: true, id: data.id };
  }

  const { data: created, error } = await supabase
    .from("catalog_promotions")
    .insert(payload)
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Errore" };
  revalidateCatalog();
  return { ok: true, id: created.id };
}

export async function softDeletePromotionAction(
  promotionId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_promotions")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", promotionId);
  if (error) return { ok: false, error: error.message };
  revalidateCatalog();
  return { ok: true, id: promotionId };
}

export async function publishCatalogVersionAction(): Promise<void> {
  const user = await requireAdmin();
  const snapshot = await loadCatalogSnapshot({ includeDrafts: true });
  if (!snapshot) return;

  const supabase = await createClient();
  const nextVersion = snapshot.version + 1;
  const published = await loadCatalogSnapshot({ includeDrafts: false });

  await supabase.from("catalog_list_versions").insert({
    version: nextVersion,
    label: `Listino ${nextVersion}`,
    snapshot: published ?? snapshot,
    published_by: user.id,
  });

  await supabase.from("app_settings").upsert({
    key: "catalog.list_version",
    value: nextVersion,
    updated_by: user.id,
  });

  revalidateCatalog();
}
