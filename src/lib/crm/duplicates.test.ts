import { describe, expect, it } from "vitest";

import { findDuplicateMatches } from "@/lib/crm/duplicates";
import type { ProspectRecord } from "@/lib/crm/types";

const base: ProspectRecord = {
  id: "11111111-1111-1111-1111-111111111111",
  legalName: "Falegnameria Rossi SRL",
  tradeName: null,
  vatNumber: "IT12345678901",
  email: "info@rossi.it",
  phone: null,
  website: "https://www.rossi.it",
  websiteDomain: "rossi.it",
  sector: "Legno",
  city: "Perugia",
  province: "PG",
  source: null,
  verifiedAt: null,
  companySizeEstimate: null,
  qualificationStatus: "new",
  interestedService: null,
  commercialPriority: "medium",
  followUpAt: null,
  notes: null,
  status: "prospect",
  duplicateGroupId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("findDuplicateMatches", () => {
  it("matches by VAT", () => {
    const matches = findDuplicateMatches(
      { legalName: "Altro", vatNumber: "IT12345678901" },
      [base],
    );
    expect(matches[0]?.reasons).toContain("Partita IVA uguale");
  });

  it("matches by email and domain", () => {
    const matches = findDuplicateMatches(
      {
        legalName: "Diversa",
        email: "INFO@rossi.it",
        website: "http://rossi.it/contatti",
      },
      [base],
    );
    expect(matches[0]?.reasons).toEqual(
      expect.arrayContaining(["Email uguale", "Dominio sito uguale"]),
    );
  });

  it("matches by legal name + city", () => {
    const matches = findDuplicateMatches(
      { legalName: "Falegnameria Rossi S.r.l.", city: "Perugia" },
      [base],
    );
    expect(matches[0]?.reasons).toContain("Ragione sociale + comune uguali");
  });

  it("does not auto-delete; only reports", () => {
    const matches = findDuplicateMatches(
      { legalName: "Unica Nuova Spa", city: "Roma" },
      [base],
    );
    expect(matches).toHaveLength(0);
  });
});
