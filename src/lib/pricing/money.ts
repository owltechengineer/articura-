/** Amounts are stored and calculated in integer cents. */

export function eurosToCents(value: number): number {
  return Math.round(value * 100);
}

export function centsToEuros(cents: number): number {
  return cents / 100;
}

export function formatCents(
  cents: number | null | undefined,
  options?: { onRequestLabel?: string; kind?: "fixed" | "from" | "on_request" | "per_unit" },
): string {
  if (options?.kind === "on_request" || cents == null) {
    return options?.onRequestLabel ?? "Su preventivo";
  }

  const formatted = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(centsToEuros(cents));

  if (options?.kind === "from") {
    return `A partire da ${formatted}`;
  }

  return formatted;
}

export function clampNonNegative(cents: number): number {
  return Math.max(0, Math.round(cents));
}
