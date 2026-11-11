export function extractWebsiteDomain(website: string | null | undefined): string | null {
  if (!website?.trim()) return null;
  try {
    const raw = website.trim().startsWith("http")
      ? website.trim()
      : `https://${website.trim()}`;
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    return host || null;
  } catch {
    const cleaned = website
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    return cleaned || null;
  }
}

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(s\.?r\.?l\.?|s\.?p\.?a\.?|s\.?a\.?s\.?|s\.?n\.?c\.?|s\.?s\.?|ditta|individuale)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email?.trim()) return null;
  return email.trim().toLowerCase();
}

export function normalizeVat(vat: string | null | undefined): string | null {
  if (!vat?.trim()) return null;
  return vat.replace(/\s+/g, "").toUpperCase();
}
