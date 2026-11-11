import "server-only";

import { formatEur, formatNumberIT, formatPercent } from "@/lib/kpi/format";
import type { KpiKind, KpiSnapshot } from "@/lib/kpi/types";
import { createClient } from "@/lib/supabase/server";

const QUALIFIED = [
  "qualified",
  "contacted",
  "interested",
  "demo_scheduled",
  "quote_sent",
  "won_client",
] as const;

const CONTACTED = [
  "contacted",
  "interested",
  "demo_scheduled",
  "quote_sent",
  "won_client",
] as const;

const RESPONSES = [
  "interested",
  "demo_scheduled",
  "quote_sent",
  "won_client",
] as const;

function metric(
  id: string,
  label: string,
  value: string,
  kind: KpiKind,
  hint: string,
) {
  return { id, label, value, kind, hint };
}

export async function loadKpiSnapshot(): Promise<KpiSnapshot> {
  const supabase = await createClient();

  const [
    orgs,
    quotes,
    quoteRequests,
    projects,
    financials,
    social,
    objectives,
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, status, qualification_status, source")
      .is("deleted_at", null),
    supabase
      .from("quotes")
      .select("id, status, total")
      .is("deleted_at", null),
    supabase
      .from("quote_requests")
      .select(
        "id, status, total_one_time_cents, total_recurring_monthly_cents, organization_id",
      )
      .is("deleted_at", null),
    supabase
      .from("projects")
      .select("id, status, budget")
      .is("deleted_at", null),
    supabase
      .from("financial_transactions")
      .select("id, kind, amount, is_recurring")
      .is("deleted_at", null),
    supabase
      .from("social_contents")
      .select("id, status, is_template, is_idea_archive")
      .is("deleted_at", null)
      .eq("is_template", false),
    supabase
      .from("strategic_objectives")
      .select(
        "id, title, metric, target_value, target_min, target_max, unit, year, is_target_only",
      )
      .is("deleted_at", null)
      .eq("year", new Date().getFullYear())
      .order("sort_order", { ascending: true }),
  ]);

  if (orgs.error) throw new Error(orgs.error.message);
  if (quotes.error) throw new Error(quotes.error.message);
  if (quoteRequests.error) throw new Error(quoteRequests.error.message);
  if (projects.error) throw new Error(projects.error.message);
  if (financials.error) throw new Error(financials.error.message);
  if (social.error) throw new Error(social.error.message);
  if (objectives.error) throw new Error(objectives.error.message);

  const organizations = orgs.data ?? [];
  const prospects = organizations.filter((o) => o.status === "prospect");
  const clientsWon = organizations.filter(
    (o) =>
      o.status === "active_client" || o.qualification_status === "won_client",
  );

  const qualified = organizations.filter((o) =>
    (QUALIFIED as readonly string[]).includes(o.qualification_status),
  ).length;
  const contacted = organizations.filter((o) =>
    (CONTACTED as readonly string[]).includes(o.qualification_status),
  ).length;
  const responses = organizations.filter((o) =>
    (RESPONSES as readonly string[]).includes(o.qualification_status),
  ).length;
  const demos = organizations.filter(
    (o) => o.qualification_status === "demo_scheduled",
  ).length;
  const quotesSentStatus = organizations.filter(
    (o) => o.qualification_status === "quote_sent",
  ).length;

  const conversionBase = prospects.length + clientsWon.length;
  const conversionRate =
    conversionBase > 0 ? clientsWon.length / conversionBase : null;

  const classicQuoteValue = (quotes.data ?? [])
    .filter((q) => ["draft", "sent", "accepted"].includes(q.status))
    .reduce((sum, q) => sum + Number(q.total ?? 0), 0);

  const requestQuoteValue =
    (quoteRequests.data ?? []).reduce(
      (sum, q) => sum + Number(q.total_one_time_cents ?? 0),
      0,
    ) / 100;

  const quoteValueEur = classicQuoteValue + requestQuoteValue;

  const quotesSentCount =
    quotesSentStatus +
    (quotes.data ?? []).filter((q) => q.status === "sent").length +
    (quoteRequests.data ?? []).filter((q) =>
      ["new", "in_review", "converted"].includes(q.status),
    ).length;

  const projectRevenueEur = (projects.data ?? []).reduce(
    (sum, p) => sum + Number(p.budget ?? 0),
    0,
  );

  const txs = financials.data ?? [];
  const collectedEur = txs
    .filter((t) => t.kind === "revenue_collected")
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  const costsEur = txs
    .filter((t) => t.kind === "cost" || t.kind === "recurring_expense")
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  const invoicedEur = txs
    .filter((t) => t.kind === "revenue_invoiced")
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

  const recurringCollected = txs
    .filter(
      (t) =>
        t.is_recurring &&
        (t.kind === "revenue_collected" || t.kind === "revenue_projected"),
    )
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

  const recurringFromQuotes =
    (quoteRequests.data ?? [])
      .filter((q) => q.status === "converted")
      .reduce(
        (sum, q) => sum + Number(q.total_recurring_monthly_cents ?? 0),
        0,
      ) / 100;

  let mrrEur = 0;
  let mrrSource: KpiKind = "unavailable";
  if (recurringCollected > 0) {
    mrrEur = recurringCollected;
    mrrSource = "real";
  } else if (recurringFromQuotes > 0) {
    mrrEur = recurringFromQuotes;
    mrrSource = "estimated";
  }

  const arrEur = mrrEur * 12;
  const revenueForMargin =
    collectedEur > 0 ? collectedEur : invoicedEur > 0 ? invoicedEur : null;
  const marginEur =
    revenueForMargin == null ? null : revenueForMargin - costsEur;

  const socialRows = (social.data ?? []).filter((s) => !s.is_idea_archive);
  const socialScheduled = socialRows.filter((s) => s.status === "scheduled")
    .length;
  const socialPublished = socialRows.filter((s) => s.status === "published")
    .length;

  const socialSources = ["linkedin", "instagram", "facebook", "tiktok", "social"];
  const socialLeads = organizations.filter((o) => {
    const source = o.source?.trim().toLowerCase() ?? "";
    return socialSources.some((s) => source.includes(s));
  }).length;

  const commercial = [
    metric(
      "prospects",
      "Prospect",
      formatNumberIT(prospects.length),
      "real",
      "Organizzazioni con status prospect",
    ),
    metric(
      "qualified",
      "Prospect qualificati",
      formatNumberIT(qualified),
      "real",
      "Stato ≥ Qualificato",
    ),
    metric(
      "contacted",
      "Aziende contattate",
      formatNumberIT(contacted),
      "real",
      "Stato ≥ Contattato",
    ),
    metric(
      "responses",
      "Risposte / interesse",
      formatNumberIT(responses),
      "real",
      "Derivato da stato ≥ Interessato (nessun campo risposta separato)",
    ),
    metric(
      "demos",
      "Demo programmate",
      formatNumberIT(demos),
      "real",
      "qualification_status = demo_scheduled",
    ),
    metric(
      "quotes_sent",
      "Preventivi inviati",
      formatNumberIT(quotesSentCount),
      "real",
      "Stati CRM + preventivi/quote_requests",
    ),
    metric(
      "won",
      "Clienti acquisiti",
      formatNumberIT(clientsWon.length),
      "real",
      "active_client o won_client",
    ),
    metric(
      "conversion",
      "Tasso di conversione",
      formatPercent(conversionRate),
      conversionRate == null ? "unavailable" : "real",
      "Clienti / (prospect + clienti)",
    ),
  ];

  const economy = [
    metric(
      "quote_value",
      "Valore preventivi",
      formatEur(quoteValueEur),
      "real",
      "Somma quotes + quote_requests (one-time)",
    ),
    metric(
      "project_revenue",
      "Ricavi da progetti (budget)",
      formatEur(projectRevenueEur),
      projectRevenueEur > 0 ? "estimated" : "unavailable",
      "Somma budget progetti — stimato se non fatturato",
    ),
    metric(
      "mrr",
      "MRR",
      mrrSource === "unavailable" ? "n/d" : formatEur(mrrEur),
      mrrSource,
      mrrSource === "real"
        ? "Da movimenti ricorrenti registrati"
        : mrrSource === "estimated"
          ? "Da quote_requests convertite (ricorrente mensile)"
          : "Nessun abbonamento/ricorrente registrato",
    ),
    metric(
      "arr",
      "ARR",
      mrrSource === "unavailable" ? "n/d" : formatEur(arrEur),
      mrrSource === "unavailable" ? "unavailable" : mrrSource,
      "MRR × 12",
    ),
    metric(
      "collected",
      "Ricavi incassati",
      formatEur(collectedEur),
      collectedEur > 0 ? "real" : "unavailable",
      "financial_transactions kind=revenue_collected",
    ),
    metric(
      "costs",
      "Costi registrati",
      formatEur(costsEur),
      costsEur > 0 ? "real" : "unavailable",
      "cost + recurring_expense",
    ),
    metric(
      "margin",
      "Margine stimato",
      marginEur == null ? "n/d" : formatEur(marginEur),
      marginEur == null ? "unavailable" : "estimated",
      "Incassato/fatturato − costi (solo se presenti dati)",
    ),
  ];

  const marketing = [
    metric(
      "social_scheduled",
      "Contenuti programmati",
      formatNumberIT(socialScheduled),
      "real",
      "social_contents status=scheduled",
    ),
    metric(
      "social_published",
      "Contenuti pubblicati",
      formatNumberIT(socialPublished),
      "real",
      "Marca manuale published (nessuna API social)",
    ),
    metric(
      "social_leads",
      "Lead da canali social",
      formatNumberIT(socialLeads),
      socialLeads > 0 ? "real" : "unavailable",
      "Prospect/clienti con source LinkedIn/Instagram/Facebook/TikTok",
    ),
    metric(
      "social_perf",
      "Performance contenuti",
      "n/d",
      "unavailable",
      "Nessuna metrica engagement collegata — non mostrata come reale",
    ),
  ];

  const targets = (objectives.data ?? []).map((o) => {
    let targetLabel = "—";
    if (o.target_min != null && o.target_max != null) {
      targetLabel = `${o.target_min}–${o.target_max}${o.unit ? ` ${o.unit}` : ""}`;
    } else if (o.target_value != null) {
      targetLabel = `${o.target_value}${o.unit ? ` ${o.unit}` : ""}`;
    }
    return metric(
      o.id,
      o.title,
      targetLabel,
      "target",
      "Obiettivo configurabile (non un risultato raggiunto)",
    );
  });

  return {
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: "commercial",
        title: "Commerciale",
        description: "Indicatori CRM da anagrafiche e stati reali.",
        metrics: commercial,
      },
      {
        id: "economy",
        title: "Economia",
        description:
          "Preventivi, progetti e movimenti finanziari. Distinti reale / stimato.",
        metrics: economy,
      },
      {
        id: "marketing",
        title: "Marketing",
        description: "Piano editoriale. Performance solo se presenti dati effettivi.",
        metrics: marketing,
      },
      {
        id: "targets",
        title: "Obiettivi (target)",
        description:
          "Dal piano strategico. Non confondere con i KPI reali sopra.",
        metrics:
          targets.length > 0
            ? targets
            : [
                metric(
                  "no_targets",
                  "Nessun obiettivo",
                  "—",
                  "unavailable",
                  "Configura target in Strategia",
                ),
              ],
      },
    ],
    raw: {
      prospects: prospects.length,
      qualified,
      contacted,
      responses,
      demos,
      quotesSent: quotesSentCount,
      clientsWon: clientsWon.length,
      conversionRate,
      quoteValueEur,
      projectRevenueEur,
      mrrEur,
      arrEur,
      mrrSource,
      collectedEur,
      costsEur,
      marginEur,
      socialScheduled,
      socialPublished,
      socialLeads,
    },
  };
}
