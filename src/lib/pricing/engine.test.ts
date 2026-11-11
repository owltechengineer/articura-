import { describe, expect, it } from "vitest";

import { calculateQuote, PricingError } from "@/lib/pricing/engine";
import type { CatalogSnapshot } from "@/lib/pricing/types";

const catalog: CatalogSnapshot = {
  version: 3,
  taxRate: 22,
  categories: [
    {
      id: "cat-1",
      slug: "siti-web",
      name: "Siti web",
      description: null,
      sortOrder: 1,
    },
  ],
  services: [
    {
      id: "svc-1",
      categoryId: "cat-1",
      slug: "sito-aziendale",
      name: "Sito aziendale",
      description: null,
      features: [],
      priceKind: "fixed",
      basePriceCents: 250000,
      recurringPriceCents: null,
      recurringPeriod: "one_time",
      isAvailableInConfigurator: true,
      status: "published",
      sortOrder: 1,
      addonIds: ["add-1", "add-2"],
    },
  ],
  addons: [
    {
      id: "add-1",
      slug: "pagine-extra",
      name: "Pagine aggiuntive",
      description: null,
      priceKind: "per_unit",
      unitPriceCents: 15000,
      recurringPriceCents: null,
      recurringPeriod: "one_time",
      minQty: 1,
      maxQty: 20,
      dependsOnAddonIds: [],
      incompatibleAddonIds: ["add-2"],
      status: "published",
      sortOrder: 1,
    },
    {
      id: "add-2",
      slug: "multilingua",
      name: "Multilingua",
      description: null,
      priceKind: "fixed",
      unitPriceCents: 80000,
      recurringPriceCents: 2000,
      recurringPeriod: "monthly",
      minQty: 1,
      maxQty: 1,
      dependsOnAddonIds: [],
      incompatibleAddonIds: ["add-1"],
      status: "published",
      sortOrder: 2,
    },
  ],
  packages: [
    {
      id: "pkg-1",
      slug: "web-crm",
      name: "Articura Web + CRM",
      description: null,
      features: ["Sito", "CRM"],
      priceKind: "fixed",
      packagePriceCents: 480000,
      recurringPriceCents: 4900,
      recurringPeriod: "monthly",
      isAvailableInConfigurator: true,
      status: "published",
      sortOrder: 1,
      serviceIds: ["svc-1"],
    },
  ],
  promotions: [
    {
      id: "promo-1",
      code: "ARTICURA10",
      name: "Sconto 10%",
      kind: "percent",
      percentOff: 10,
      amountOffCents: null,
      packageId: null,
      promoPackagePriceCents: null,
      startsAt: null,
      endsAt: null,
      isActive: true,
      stackable: false,
    },
    {
      id: "promo-2",
      code: null,
      name: "Promo pacchetto",
      kind: "package_price",
      percentOff: null,
      amountOffCents: null,
      packageId: "pkg-1",
      promoPackagePriceCents: 420000,
      startsAt: null,
      endsAt: null,
      isActive: true,
      stackable: false,
    },
  ],
};

describe("calculateQuote", () => {
  it("calcola servizio + addon e IVA", () => {
    const result = calculateQuote(catalog, {
      mode: "service",
      serviceId: "svc-1",
      addons: [{ addonId: "add-1", quantity: 2 }],
    });

    expect(result.subtotalOneTimeCents).toBe(280000);
    expect(result.taxCents).toBe(61600);
    expect(result.totalOneTimeCents).toBe(341600);
    expect(result.hasOnRequestItems).toBe(false);
    expect(result.listVersion).toBe(3);
  });

  it("applica sconto percentuale e impedisce totali negativi", () => {
    const result = calculateQuote(catalog, {
      mode: "service",
      serviceId: "svc-1",
      addons: [],
      promoCode: "ARTICURA10",
    });

    expect(result.discountCents).toBe(25000);
    expect(result.totalOneTimeCents).toBe(274500);
  });

  it("usa prezzo pacchetto indipendente e promo pacchetto", () => {
    const result = calculateQuote(catalog, {
      mode: "package",
      packageId: "pkg-1",
      addons: [],
    });

    expect(result.discountCents).toBe(60000);
    expect(result.totalRecurringMonthlyCents).toBe(4900);
    expect(result.subtotalOneTimeCents).toBe(480000);
    // 420000 + IVA 22%
    expect(result.totalOneTimeCents).toBe(512400);
  });

  it("blocca opzioni incompatibili", () => {
    expect(() =>
      calculateQuote(catalog, {
        mode: "service",
        serviceId: "svc-1",
        addons: [
          { addonId: "add-1", quantity: 1 },
          { addonId: "add-2", quantity: 1 },
        ],
      }),
    ).toThrow(PricingError);
  });

  it("non si fida di prezzi client: solo id e quantità", () => {
    const result = calculateQuote(catalog, {
      mode: "service",
      serviceId: "svc-1",
      addons: [{ addonId: "add-2", quantity: 1 }],
    });
    const addonLine = result.lines.find((line) => line.refId === "add-2");
    expect(addonLine?.lineTotalCents).toBe(80000);
    expect(result.totalRecurringMonthlyCents).toBe(2000);
  });
});
