import { formatCents } from "@/lib/pricing/money";
import type { PriceKind } from "@/lib/pricing/types";

export function priceLabel(
  cents: number | null,
  kind: PriceKind,
): string {
  return formatCents(cents, { kind, onRequestLabel: "Su preventivo" });
}

export function statusLabel(status: "draft" | "published") {
  return status === "published" ? "Pubblicato" : "Bozza";
}
