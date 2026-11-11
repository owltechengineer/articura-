import {
  normalizeCompanyName,
  normalizeEmail,
  normalizeVat,
  extractWebsiteDomain,
} from "@/lib/crm/domain";
import type { DuplicateMatch, ProspectInput, ProspectRecord } from "@/lib/crm/types";

export function findDuplicateMatches(
  candidate: ProspectInput,
  existing: ProspectRecord[],
  options?: { excludeId?: string },
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const candidateVat = normalizeVat(candidate.vatNumber);
  const candidateEmail = normalizeEmail(candidate.email);
  const candidateDomain = extractWebsiteDomain(candidate.website ?? null);
  const candidateName = normalizeCompanyName(candidate.legalName);
  const candidateCity = candidate.city?.trim().toLowerCase() ?? "";

  for (const row of existing) {
    if (options?.excludeId && row.id === options.excludeId) continue;

    const reasons: string[] = [];
    const rowVat = normalizeVat(row.vatNumber);
    const rowEmail = normalizeEmail(row.email);
    const rowDomain = row.websiteDomain ?? extractWebsiteDomain(row.website);
    const rowName = normalizeCompanyName(row.legalName);
    const rowCity = row.city?.trim().toLowerCase() ?? "";

    if (candidateVat && rowVat && candidateVat === rowVat) {
      reasons.push("Partita IVA uguale");
    }
    if (candidateEmail && rowEmail && candidateEmail === rowEmail) {
      reasons.push("Email uguale");
    }
    if (candidateDomain && rowDomain && candidateDomain === rowDomain) {
      reasons.push("Dominio sito uguale");
    }
    if (
      candidateName &&
      rowName &&
      candidateName === rowName &&
      candidateCity &&
      rowCity &&
      candidateCity === rowCity
    ) {
      reasons.push("Ragione sociale + comune uguali");
    } else if (candidateName && rowName && candidateName === rowName) {
      reasons.push("Ragione sociale uguale");
    }

    if (reasons.length > 0) {
      matches.push({
        existingId: row.id,
        existingName: row.legalName,
        reasons,
      });
    }
  }

  return matches;
}
