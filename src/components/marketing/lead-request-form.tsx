"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { submitLeadRequestAction } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BUDGET_RANGES,
  COMPANY_SIZES,
  SERVICE_INTERESTS,
  TIMELINES,
  type LeadRequestInput,
} from "@/lib/leads/validations";

const SERVICE_LABELS: Record<(typeof SERVICE_INTERESTS)[number], string> = {
  siti_web: "Siti web / presenza digitale",
  software: "Software personalizzato",
  digitalizzazione: "Digitalizzazione processi",
  automazioni_ai: "Automazioni & AI",
  crm: "CRM / commerciale",
  non_so: "Non so ancora",
};

const SIZE_LABELS: Record<(typeof COMPANY_SIZES)[number], string> = {
  "1-5": "1–5 addetti",
  "6-10": "6–10 addetti",
  "11-20": "11–20 addetti",
  "21-50": "21–50 addetti",
  "50+": "Oltre 50",
  non_so: "Non so",
};

const BUDGET_LABELS: Record<(typeof BUDGET_RANGES)[number], string> = {
  da_definire: "Da definire",
  sotto_2k: "Sotto 2.000 €",
  "2k_5k": "2.000–5.000 €",
  "5k_15k": "5.000–15.000 €",
  oltre_15k: "Oltre 15.000 €",
};

const TIMELINE_LABELS: Record<(typeof TIMELINES)[number], string> = {
  subito: "Il prima possibile",
  "1_3_mesi": "1–3 mesi",
  "3_6_mesi": "3–6 mesi",
  oltre_6_mesi: "Oltre 6 mesi",
  solo_informazioni: "Solo informazioni",
};

type Props = {
  kind?: LeadRequestInput["kind"];
  title?: string;
  subtitle?: string;
};

const emptyForm = {
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactRole: "",
  companyName: "",
  vatNumber: "",
  website: "",
  city: "",
  province: "",
  sector: "",
  companySize: "" as "" | (typeof COMPANY_SIZES)[number],
  interestedService: "" as "" | (typeof SERVICE_INTERESTS)[number],
  budgetRange: "" as "" | (typeof BUDGET_RANGES)[number],
  timeline: "" as "" | (typeof TIMELINES)[number],
  howHeard: "",
  currentTools: "",
  message: "",
  privacyAccepted: false,
  marketingOptIn: false,
};

export function LeadRequestForm({
  kind = "contact",
  title = "Raccontaci il contesto",
  subtitle = "Più dettagli ci dai, più sarà mirato il primo confronto. Nessuna email promozionale automatica.",
}: Props) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function update<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitLeadRequestAction({
        kind,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || null,
        contactRole: form.contactRole || null,
        companyName: form.companyName,
        vatNumber: form.vatNumber || null,
        website: form.website || null,
        city: form.city || null,
        province: form.province || null,
        sector: form.sector || null,
        companySize: form.companySize || null,
        interestedService: form.interestedService || null,
        budgetRange: form.budgetRange || null,
        timeline: form.timeline || null,
        howHeard: form.howHeard || null,
        currentTools: form.currentTools || null,
        message: form.message,
        privacyAccepted: form.privacyAccepted,
        marketingOptIn: form.marketingOptIn,
      });
      if (!result.ok) {
        setError(result.error ?? "Invio non riuscito");
        return;
      }
      setDone(result.requestNumber ?? "ok");
      setForm(emptyForm);
    });
  }

  if (done) {
    return (
      <div className="border border-border bg-background-secondary/50 p-8">
        <p className="font-display text-2xl font-semibold">Richiesta inviata</p>
        <p className="mt-3 text-sm text-foreground-muted">
          Grazie. Il riferimento è <strong>{done}</strong>. Ti ricontattiamo
          senza impegno commerciale automatico.
        </p>
        <Button
          type="button"
          className="mt-6"
          variant="secondary"
          onClick={() => setDone(null)}
        >
          Invia un’altra richiesta
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p>
      </div>

      <fieldset className="space-y-4">
        <legend className="font-display text-sm font-semibold tracking-wide">
          Contatto
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome e cognome *">
            <Input
              required
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
            />
          </Field>
          <Field label="Ruolo in azienda">
            <Input
              value={form.contactRole}
              onChange={(e) => update("contactRole", e.target.value)}
              placeholder="Titolare, responsabile, …"
            />
          </Field>
          <Field label="Email aziendale *">
            <Input
              required
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
          </Field>
          <Field label="Telefono">
            <Input
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-sm font-semibold tracking-wide">
          Azienda
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ragione sociale *">
            <Input
              required
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </Field>
          <Field label="Partita IVA">
            <Input
              value={form.vatNumber}
              onChange={(e) => update("vatNumber", e.target.value)}
            />
          </Field>
          <Field label="Settore">
            <Input
              value={form.sector}
              onChange={(e) => update("sector", e.target.value)}
              placeholder="Metalmeccanico, artigianato, …"
            />
          </Field>
          <Field label="Dimensione">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.companySize}
              onChange={(e) =>
                update(
                  "companySize",
                  e.target.value as typeof form.companySize,
                )
              }
            >
              <option value="">—</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {SIZE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Comune">
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>
          <Field label="Provincia">
            <Input
              value={form.province}
              onChange={(e) => update("province", e.target.value)}
              maxLength={10}
            />
          </Field>
          <Field label="Sito web">
            <Input
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://"
            />
          </Field>
          <Field label="Come ci hai conosciuto">
            <Input
              value={form.howHeard}
              onChange={(e) => update("howHeard", e.target.value)}
              placeholder="LinkedIn, referral, ricerca, …"
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-sm font-semibold tracking-wide">
          Progetto
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Servizio di interesse">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.interestedService}
              onChange={(e) =>
                update(
                  "interestedService",
                  e.target.value as typeof form.interestedService,
                )
              }
            >
              <option value="">—</option>
              {SERVICE_INTERESTS.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Budget orientativo">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.budgetRange}
              onChange={(e) =>
                update("budgetRange", e.target.value as typeof form.budgetRange)
              }
            >
              <option value="">—</option>
              {BUDGET_RANGES.map((s) => (
                <option key={s} value={s}>
                  {BUDGET_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tempistiche">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.timeline}
              onChange={(e) =>
                update("timeline", e.target.value as typeof form.timeline)
              }
            >
              <option value="">—</option>
              {TIMELINES.map((s) => (
                <option key={s} value={s}>
                  {TIMELINE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Strumenti usati oggi">
            <Input
              value={form.currentTools}
              onChange={(e) => update("currentTools", e.target.value)}
              placeholder="Excel, gestionale, email, …"
            />
          </Field>
        </div>
        <Field label="Messaggio / esigenze *">
          <textarea
            required
            minLength={10}
            className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Descrivi processo, vincoli e obiettivo."
          />
        </Field>
      </fieldset>

      <div className="space-y-3 text-sm">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.privacyAccepted}
            onChange={(e) => update("privacyAccepted", e.target.checked)}
            required
          />
          <span>
            Dichiaro di aver letto la{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              privacy policy
            </Link>{" "}
            e autorizzo il trattamento dei dati per rispondere a questa
            richiesta. *
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.marketingOptIn}
            onChange={(e) => update("marketingOptIn", e.target.checked)}
          />
          <span>
            Voglio ricevere aggiornamenti commerciali (facoltativo). Senza
            questo consenso non inviamo contenuti promozionali.
          </span>
        </label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Invio in corso…" : "Invia richiesta"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
