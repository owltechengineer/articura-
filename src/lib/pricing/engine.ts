import { clampNonNegative } from "@/lib/pricing/money";
import type {
  CatalogAddon,
  CatalogSnapshot,
  ConfiguratorSelection,
  PricedLine,
  PricingResult,
  SelectionAddon,
} from "@/lib/pricing/types";

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

function isPromotionActive(
  promo: CatalogSnapshot["promotions"][number],
  now: Date,
): boolean {
  if (!promo.isActive) return false;
  if (promo.startsAt && new Date(promo.startsAt) > now) return false;
  if (promo.endsAt && new Date(promo.endsAt) < now) return false;
  return true;
}

function validateAddonCompatibility(
  selected: SelectionAddon[],
  addonsById: Map<string, CatalogAddon>,
) {
  const selectedIds = new Set(selected.map((item) => item.addonId));

  for (const item of selected) {
    const addon = addonsById.get(item.addonId);
    if (!addon) {
      throw new PricingError(`Opzione non valida: ${item.addonId}`);
    }

    if (item.quantity < addon.minQty) {
      throw new PricingError(
        `Quantità minima per ${addon.name}: ${addon.minQty}`,
      );
    }
    if (addon.maxQty != null && item.quantity > addon.maxQty) {
      throw new PricingError(
        `Quantità massima per ${addon.name}: ${addon.maxQty}`,
      );
    }

    for (const dep of addon.dependsOnAddonIds) {
      if (!selectedIds.has(dep)) {
        throw new PricingError(
          `L'opzione ${addon.name} richiede un'altra funzionalità compatibile.`,
        );
      }
    }

    for (const incompatible of addon.incompatibleAddonIds) {
      if (selectedIds.has(incompatible)) {
        throw new PricingError(
          `L'opzione ${addon.name} è incompatibile con un'altra selezione.`,
        );
      }
    }
  }
}

function lineFromAddon(
  addon: CatalogAddon,
  quantity: number,
): PricedLine {
  const unit = addon.unitPriceCents;
  const isOnRequest =
    addon.priceKind === "on_request" || unit == null;

  const lineTotal =
    isOnRequest || unit == null ? null : clampNonNegative(unit * quantity);

  const recurring =
    addon.recurringPriceCents == null
      ? null
      : clampNonNegative(addon.recurringPriceCents * quantity);

  return {
    itemType: "addon",
    refId: addon.id,
    name: addon.name,
    quantity,
    unitPriceCents: unit,
    lineTotalCents: lineTotal,
    recurringPriceCents: recurring,
    recurringPeriod:
      recurring == null ? null : addon.recurringPeriod,
    priceKind: addon.priceKind,
  };
}

/**
 * Server-side pricing engine.
 * Never trusts browser-sent prices — only IDs, quantities and promo code.
 */
export function calculateQuote(
  catalog: CatalogSnapshot,
  selection: ConfiguratorSelection,
  options?: { now?: Date },
): PricingResult {
  const now = options?.now ?? new Date();
  const addonsById = new Map(catalog.addons.map((addon) => [addon.id, addon]));
  const servicesById = new Map(
    catalog.services.map((service) => [service.id, service]),
  );
  const packagesById = new Map(
    catalog.packages.map((pkg) => [pkg.id, pkg]),
  );

  const lines: PricedLine[] = [];
  let allowedAddonIds: Set<string> | null = null;
  let packagePromoTargetId: string | null = null;

  if (selection.mode === "service") {
    if (!selection.serviceId) {
      throw new PricingError("Seleziona un servizio.");
    }
    const service = servicesById.get(selection.serviceId);
    if (!service) {
      throw new PricingError("Servizio non trovato.");
    }

    allowedAddonIds = new Set(service.addonIds);
    const onRequest =
      service.priceKind === "on_request" || service.basePriceCents == null;

    lines.push({
      itemType: "service",
      refId: service.id,
      name: service.name,
      quantity: 1,
      unitPriceCents: service.basePriceCents,
      lineTotalCents: onRequest ? null : service.basePriceCents,
      recurringPriceCents: service.recurringPriceCents,
      recurringPeriod:
        service.recurringPriceCents == null
          ? null
          : service.recurringPeriod,
      priceKind: service.priceKind,
    });
  } else {
    if (!selection.packageId) {
      throw new PricingError("Seleziona un pacchetto.");
    }
    const pkg = packagesById.get(selection.packageId);
    if (!pkg) {
      throw new PricingError("Pacchetto non trovato.");
    }

    packagePromoTargetId = pkg.id;
    allowedAddonIds = new Set(
      pkg.serviceIds.flatMap(
        (serviceId) => servicesById.get(serviceId)?.addonIds ?? [],
      ),
    );

    const onRequest =
      pkg.priceKind === "on_request" || pkg.packagePriceCents == null;

    lines.push({
      itemType: "package",
      refId: pkg.id,
      name: pkg.name,
      quantity: 1,
      unitPriceCents: pkg.packagePriceCents,
      lineTotalCents: onRequest ? null : pkg.packagePriceCents,
      recurringPriceCents: pkg.recurringPriceCents,
      recurringPeriod:
        pkg.recurringPriceCents == null ? null : pkg.recurringPeriod,
      priceKind: pkg.priceKind,
    });
  }

  const selectedAddons = selection.addons ?? [];
  for (const item of selectedAddons) {
    if (allowedAddonIds && !allowedAddonIds.has(item.addonId)) {
      throw new PricingError(
        "Un'opzione selezionata non è compatibile con il servizio/pacchetto.",
      );
    }
  }

  validateAddonCompatibility(selectedAddons, addonsById);

  for (const item of selectedAddons) {
    const addon = addonsById.get(item.addonId)!;
    lines.push(lineFromAddon(addon, item.quantity));
  }

  let subtotalOneTimeCents = 0;
  let totalRecurringMonthlyCents = 0;
  let totalRecurringYearlyCents = 0;
  let hasOnRequestItems = false;

  for (const line of lines) {
    if (line.lineTotalCents == null || line.priceKind === "on_request") {
      hasOnRequestItems = true;
    } else {
      subtotalOneTimeCents += line.lineTotalCents;
    }

    if (line.recurringPriceCents != null && line.recurringPeriod === "monthly") {
      totalRecurringMonthlyCents += line.recurringPriceCents;
    }
    if (line.recurringPriceCents != null && line.recurringPeriod === "yearly") {
      totalRecurringYearlyCents += line.recurringPriceCents;
    }
  }

  const appliedPromotionIds: string[] = [];
  let discountCents = 0;
  let packagePriceOverride: number | null = null;

  const promoCode = selection.promoCode?.trim().toLowerCase() || null;
  const candidates = catalog.promotions.filter((promo) =>
    isPromotionActive(promo, now),
  );

  const matching = candidates.filter((promo) => {
    if (promo.code) {
      return promoCode != null && promo.code.toLowerCase() === promoCode;
    }
    // Automatic promotions without code
    if (promo.kind === "package_price") {
      return (
        packagePromoTargetId != null && promo.packageId === packagePromoTargetId
      );
    }
    return !promo.code;
  });

  // Prefer non-stackable: take best single discount; if stackable, sum stackable ones
  const nonStackable = matching.filter((promo) => !promo.stackable);
  const stackable = matching.filter((promo) => promo.stackable);

  const applyPromo = (
    promo: (typeof matching)[number],
  ): { discount: number; override: number | null } => {
    if (promo.kind === "percent" && promo.percentOff != null) {
      return {
        discount: clampNonNegative(
          Math.round((subtotalOneTimeCents * promo.percentOff) / 100),
        ),
        override: null,
      };
    }
    if (promo.kind === "fixed_amount" && promo.amountOffCents != null) {
      return {
        discount: clampNonNegative(
          Math.min(promo.amountOffCents, subtotalOneTimeCents),
        ),
        override: null,
      };
    }
    if (
      promo.kind === "package_price" &&
      promo.promoPackagePriceCents != null &&
      packagePromoTargetId &&
      promo.packageId === packagePromoTargetId
    ) {
      return { discount: 0, override: promo.promoPackagePriceCents };
    }
    return { discount: 0, override: null };
  };

  if (nonStackable.length > 0) {
    let best = { discount: 0, override: null as number | null, id: "" };
    for (const promo of nonStackable) {
      const result = applyPromo(promo);
      const score =
        result.override != null
          ? subtotalOneTimeCents - result.override
          : result.discount;
      const bestScore =
        best.override != null
          ? subtotalOneTimeCents - best.override
          : best.discount;
      if (score > bestScore) {
        best = { ...result, id: promo.id };
      }
    }
    if (best.id) {
      discountCents = best.discount;
      packagePriceOverride = best.override;
      appliedPromotionIds.push(best.id);
    }
  } else {
    for (const promo of stackable) {
      const result = applyPromo(promo);
      discountCents += result.discount;
      if (result.override != null) {
        packagePriceOverride = result.override;
      }
      appliedPromotionIds.push(promo.id);
    }
  }

  if (packagePriceOverride != null) {
    const packageLine = lines.find((line) => line.itemType === "package");
    if (packageLine && packageLine.lineTotalCents != null) {
      const delta = packageLine.lineTotalCents - packagePriceOverride;
      if (delta > 0) {
        // Apply promotional package price on the line itself.
        // Do not also subtract the same amount as a separate discount.
        packageLine.lineTotalCents = packagePriceOverride;
        packageLine.unitPriceCents = packagePriceOverride;
        subtotalOneTimeCents = lines
          .filter((line) => line.itemType !== "discount")
          .reduce((sum, line) => sum + (line.lineTotalCents ?? 0), 0);
        discountCents += delta;
      }
    }
  }

  const packagePromoApplied = packagePriceOverride != null;
  // Package promo already reduced line totals; percent/fixed discounts subtract here.
  const discountForMath = packagePromoApplied ? 0 : discountCents;
  discountCents = clampNonNegative(discountCents);

  if (discountCents > 0) {
    lines.push({
      itemType: "discount",
      refId: appliedPromotionIds[0] ?? null,
      name: packagePromoApplied
        ? "Risparmio promozione pacchetto"
        : "Sconto",
      quantity: 1,
      unitPriceCents: -discountCents,
      lineTotalCents: -discountCents,
      recurringPriceCents: null,
      recurringPeriod: null,
      priceKind: "fixed",
    });
  }

  const taxable = clampNonNegative(subtotalOneTimeCents - discountForMath);
  const taxRate = catalog.taxRate;
  const taxCents =
    taxRate == null
      ? 0
      : clampNonNegative(Math.round((taxable * taxRate) / 100));

  if (taxCents > 0 && taxRate != null) {
    lines.push({
      itemType: "tax",
      refId: null,
      name: `IVA ${taxRate}%`,
      quantity: 1,
      unitPriceCents: taxCents,
      lineTotalCents: taxCents,
      recurringPriceCents: null,
      recurringPeriod: null,
      priceKind: "fixed",
    });
  }

  return {
    lines,
    subtotalOneTimeCents: packagePromoApplied
      ? subtotalOneTimeCents + discountCents
      : subtotalOneTimeCents,
    discountCents,
    taxRate,
    taxCents,
    totalOneTimeCents: clampNonNegative(taxable + taxCents),
    totalRecurringMonthlyCents: clampNonNegative(totalRecurringMonthlyCents),
    totalRecurringYearlyCents: clampNonNegative(totalRecurringYearlyCents),
    hasOnRequestItems,
    appliedPromotionIds,
    listVersion: catalog.version,
  };
}
