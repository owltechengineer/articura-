import { describe, expect, it } from "vitest";

import { isOfficiallyVerifiedOpen } from "@/lib/funding/types";

describe("isOfficiallyVerifiedOpen", () => {
  const today = new Date("2026-06-15T12:00:00Z");

  it("rejects without official url or verification", () => {
    expect(
      isOfficiallyVerifiedOpen(
        {
          status: "to_evaluate",
          opensOn: "2026-01-01",
          closesOn: "2026-12-31",
          lastVerifiedAt: null,
          officialUrl: null,
        },
        { today },
      ).open,
    ).toBe(false);
  });

  it("accepts only with recent official verification", () => {
    expect(
      isOfficiallyVerifiedOpen(
        {
          status: "in_preparation",
          opensOn: "2026-01-01",
          closesOn: "2026-12-31",
          lastVerifiedAt: "2026-06-10",
          officialUrl: "https://example.gov.it/bando",
        },
        { today },
      ).open,
    ).toBe(true);
  });

  it("rejects stale verification", () => {
    expect(
      isOfficiallyVerifiedOpen(
        {
          status: "in_preparation",
          opensOn: "2026-01-01",
          closesOn: "2026-12-31",
          lastVerifiedAt: "2026-01-01",
          officialUrl: "https://example.gov.it/bando",
        },
        { today, maxAgeDays: 14 },
      ).open,
    ).toBe(false);
  });
});
