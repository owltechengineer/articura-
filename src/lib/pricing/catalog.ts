import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  CatalogAddon,
  CatalogCategory,
  CatalogPackage,
  CatalogPromotion,
  CatalogService,
  CatalogSnapshot,
  PublishStatus,
} from "@/lib/pricing/types";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function loadCatalogSnapshot(options?: {
  includeDrafts?: boolean;
}): Promise<CatalogSnapshot | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const includeDrafts = options?.includeDrafts ?? false;
  const supabase = await createClient();

  const [
    categoriesRes,
    servicesRes,
    addonsRes,
    linksRes,
    packagesRes,
    packageItemsRes,
    promotionsRes,
    settingsRes,
    versionsRes,
  ] = await Promise.all([
    supabase
      .from("catalog_categories")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order"),
    supabase
      .from("catalog_services")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order"),
    supabase
      .from("catalog_addons")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order"),
    supabase.from("catalog_service_addons").select("service_id, addon_id"),
    supabase
      .from("catalog_packages")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order"),
    supabase
      .from("catalog_package_items")
      .select("package_id, service_id, sort_order")
      .order("sort_order"),
    supabase
      .from("catalog_promotions")
      .select("*")
      .is("deleted_at", null),
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["fiscal.default_tax_rate", "catalog.list_version"]),
    supabase
      .from("catalog_list_versions")
      .select("version")
      .order("version", { ascending: false })
      .limit(1),
  ]);

  const addonIdsByService = new Map<string, string[]>();
  for (const link of linksRes.data ?? []) {
    const list = addonIdsByService.get(link.service_id) ?? [];
    list.push(link.addon_id);
    addonIdsByService.set(link.service_id, list);
  }

  const serviceIdsByPackage = new Map<string, string[]>();
  for (const item of packageItemsRes.data ?? []) {
    const list = serviceIdsByPackage.get(item.package_id) ?? [];
    list.push(item.service_id);
    serviceIdsByPackage.set(item.package_id, list);
  }

  const categories: CatalogCategory[] = (categoriesRes.data ?? [])
    .filter((row) => includeDrafts || row.is_active)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      sortOrder: row.sort_order,
    }));

  const services: CatalogService[] = (servicesRes.data ?? [])
    .filter((row) => {
      if (includeDrafts) return true;
      return (
        row.is_active &&
        row.status === "published" &&
        row.is_available_in_configurator
      );
    })
    .map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      features: asStringArray(row.features),
      priceKind: row.price_kind,
      basePriceCents: row.base_price_cents,
      recurringPriceCents: row.recurring_price_cents,
      recurringPeriod: row.recurring_period,
      isAvailableInConfigurator: row.is_available_in_configurator,
      status: row.status as PublishStatus,
      sortOrder: row.sort_order,
      addonIds: addonIdsByService.get(row.id) ?? [],
    }));

  const addons: CatalogAddon[] = (addonsRes.data ?? [])
    .filter((row) => {
      if (includeDrafts) return true;
      return row.is_active && row.status === "published";
    })
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      priceKind: row.price_kind,
      unitPriceCents: row.unit_price_cents,
      recurringPriceCents: row.recurring_price_cents,
      recurringPeriod: row.recurring_period,
      minQty: row.min_qty,
      maxQty: row.max_qty,
      dependsOnAddonIds: row.depends_on_addon_ids ?? [],
      incompatibleAddonIds: row.incompatible_addon_ids ?? [],
      status: row.status as PublishStatus,
      sortOrder: row.sort_order,
    }));

  const packages: CatalogPackage[] = (packagesRes.data ?? [])
    .filter((row) => {
      if (includeDrafts) return true;
      return (
        row.is_active &&
        row.status === "published" &&
        row.is_available_in_configurator
      );
    })
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      features: asStringArray(row.features),
      priceKind: row.price_kind,
      packagePriceCents: row.package_price_cents,
      recurringPriceCents: row.recurring_price_cents,
      recurringPeriod: row.recurring_period,
      isAvailableInConfigurator: row.is_available_in_configurator,
      status: row.status as PublishStatus,
      sortOrder: row.sort_order,
      serviceIds: serviceIdsByPackage.get(row.id) ?? [],
    }));

  const promotions: CatalogPromotion[] = (promotionsRes.data ?? []).map(
    (row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      kind: row.kind,
      percentOff: row.percent_off == null ? null : Number(row.percent_off),
      amountOffCents: row.amount_off_cents,
      packageId: row.package_id,
      promoPackagePriceCents: row.promo_package_price_cents,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      isActive: row.is_active,
      stackable: row.stackable,
    }),
  );

  const settings = new Map(
    (settingsRes.data ?? []).map((row) => [row.key, row.value]),
  );
  const taxRaw = settings.get("fiscal.default_tax_rate");
  const taxRate =
    taxRaw == null || taxRaw === null ? null : Number(taxRaw);

  const versionFromTable = versionsRes.data?.[0]?.version;
  const versionFromSettings = Number(settings.get("catalog.list_version") ?? 1);

  return {
    version: versionFromTable ?? versionFromSettings ?? 1,
    categories,
    services,
    addons,
    packages,
    promotions: includeDrafts
      ? promotions
      : promotions.filter((promo) => promo.isActive),
    taxRate: Number.isFinite(taxRate) ? taxRate : null,
  };
}
