import type { KpiKind } from "@/lib/kpi/types";

export function formatNumberIT(value: number, digits = 0): string {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatEur(value: number, digits = 0): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "n/d";
  return `${formatNumberIT(value * 100, 1)}%`;
}

export const KPI_KIND_LABELS: Record<KpiKind, string> = {
  real: "Reale",
  estimated: "Stimato",
  target: "Obiettivo",
  unavailable: "Non disponibile",
};
