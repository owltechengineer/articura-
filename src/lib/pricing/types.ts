export type PriceKind = "fixed" | "from" | "on_request" | "per_unit";
export type BillingPeriod = "one_time" | "monthly" | "yearly";
export type PublishStatus = "draft" | "published";
export type PromotionKind = "percent" | "fixed_amount" | "package_price";

export type CatalogService = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string | null;
  features: string[];
  priceKind: PriceKind;
  basePriceCents: number | null;
  recurringPriceCents: number | null;
  recurringPeriod: BillingPeriod;
  isAvailableInConfigurator: boolean;
  status: PublishStatus;
  sortOrder: number;
  addonIds: string[];
};

export type CatalogAddon = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceKind: PriceKind;
  unitPriceCents: number | null;
  recurringPriceCents: number | null;
  recurringPeriod: BillingPeriod;
  minQty: number;
  maxQty: number | null;
  dependsOnAddonIds: string[];
  incompatibleAddonIds: string[];
  status: PublishStatus;
  sortOrder: number;
};

export type CatalogPackage = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  features: string[];
  priceKind: PriceKind;
  packagePriceCents: number | null;
  recurringPriceCents: number | null;
  recurringPeriod: BillingPeriod;
  isAvailableInConfigurator: boolean;
  status: PublishStatus;
  sortOrder: number;
  serviceIds: string[];
};

export type CatalogPromotion = {
  id: string;
  code: string | null;
  name: string;
  kind: PromotionKind;
  percentOff: number | null;
  amountOffCents: number | null;
  packageId: string | null;
  promoPackagePriceCents: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  stackable: boolean;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type CatalogSnapshot = {
  version: number;
  categories: CatalogCategory[];
  services: CatalogService[];
  addons: CatalogAddon[];
  packages: CatalogPackage[];
  promotions: CatalogPromotion[];
  taxRate: number | null;
};

export type SelectionAddon = {
  addonId: string;
  quantity: number;
};

export type ConfiguratorSelection = {
  mode: "service" | "package";
  serviceId?: string;
  packageId?: string;
  addons: SelectionAddon[];
  promoCode?: string | null;
};

export type PricedLine = {
  itemType: "service" | "package" | "addon" | "discount" | "tax";
  refId: string | null;
  name: string;
  quantity: number;
  unitPriceCents: number | null;
  lineTotalCents: number | null;
  recurringPriceCents: number | null;
  recurringPeriod: BillingPeriod | null;
  priceKind: PriceKind;
};

export type PricingResult = {
  lines: PricedLine[];
  subtotalOneTimeCents: number;
  discountCents: number;
  taxRate: number | null;
  taxCents: number;
  totalOneTimeCents: number;
  totalRecurringMonthlyCents: number;
  totalRecurringYearlyCents: number;
  hasOnRequestItems: boolean;
  appliedPromotionIds: string[];
  listVersion: number;
};
