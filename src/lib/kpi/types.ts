export type KpiKind = "real" | "estimated" | "target" | "unavailable";

export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  kind: KpiKind;
  hint: string;
};

export type KpiSection = {
  id: string;
  title: string;
  description: string;
  metrics: KpiMetric[];
};

export type KpiSnapshot = {
  generatedAt: string;
  sections: KpiSection[];
  raw: {
    prospects: number;
    qualified: number;
    contacted: number;
    responses: number;
    demos: number;
    quotesSent: number;
    clientsWon: number;
    conversionRate: number | null;
    quoteValueEur: number;
    projectRevenueEur: number;
    mrrEur: number;
    arrEur: number;
    mrrSource: KpiKind;
    collectedEur: number;
    costsEur: number;
    marginEur: number | null;
    socialScheduled: number;
    socialPublished: number;
    socialLeads: number;
  };
};
