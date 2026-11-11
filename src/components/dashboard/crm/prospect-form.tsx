"use client";

import { useState, useTransition } from "react";

import { upsertProspectAction } from "@/app/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  toDateInputValue,
  toDateTimeLocalValue,
} from "@/components/dashboard/crm/format";
import {
  COMMERCIAL_PRIORITIES,
  PRIORITY_LABELS,
  QUALIFICATION_LABELS,
  QUALIFICATION_STATUSES,
  type DuplicateMatch,
  type ProspectRecord,
} from "@/lib/crm/types";

type FormState = {
  legalName: string;
  tradeName: string;
  vatNumber: string;
  email: string;
  phone: string;
  website: string;
  sector: string;
  city: string;
  province: string;
  source: string;
  verifiedAt: string;
  companySizeEstimate: string;
  qualificationStatus: (typeof QUALIFICATION_STATUSES)[number];
  interestedService: string;
  commercialPriority: (typeof COMMERCIAL_PRIORITIES)[number];
  followUpAt: string;
  notes: string;
};

const emptyForm: FormState = {
  legalName: "",
  tradeName: "",
  vatNumber: "",
  email: "",
  phone: "",
  website: "",
  sector: "",
  city: "",
  province: "",
  source: "",
  verifiedAt: "",
  companySizeEstimate: "",
  qualificationStatus: "new",
  interestedService: "",
  commercialPriority: "medium",
  followUpAt: "",
  notes: "",
};

function fromProspect(p: ProspectRecord): FormState {
  return {
    legalName: p.legalName,
    tradeName: p.tradeName ?? "",
    vatNumber: p.vatNumber ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    website: p.website ?? "",
    sector: p.sector ?? "",
    city: p.city ?? "",
    province: p.province ?? "",
    source: p.source ?? "",
    verifiedAt: toDateInputValue(p.verifiedAt),
    companySizeEstimate: p.companySizeEstimate ?? "",
    qualificationStatus: p.qualificationStatus,
    interestedService: p.interestedService ?? "",
    commercialPriority: p.commercialPriority,
    followUpAt: toDateTimeLocalValue(p.followUpAt),
    notes: p.notes ?? "",
  };
}

type Props = {
  prospect?: ProspectRecord;
  onDone?: () => void;
  onCancel?: () => void;
};

export function ProspectForm({ prospect, onDone, onCancel }: Props) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(
    prospect ? fromProspect(prospect) : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [force, setForce] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await upsertProspectAction({
        id: prospect?.id,
        ...form,
        email: form.email || null,
        tradeName: form.tradeName || null,
        vatNumber: form.vatNumber || null,
        phone: form.phone || null,
        website: form.website || null,
        sector: form.sector || null,
        city: form.city || null,
        province: form.province || null,
        source: form.source || null,
        verifiedAt: form.verifiedAt || null,
        companySizeEstimate: form.companySizeEstimate || null,
        interestedService: form.interestedService || null,
        followUpAt: form.followUpAt
          ? new Date(form.followUpAt).toISOString()
          : null,
        notes: form.notes || null,
        forceSaveDespiteDuplicates: force,
      });

      if (!result.ok) {
        setError(result.error ?? "Errore");
        setDuplicates(result.duplicates ?? []);
        return;
      }

      if (result.duplicates?.length && !force) {
        setDuplicates(result.duplicates);
        setError(result.error ?? "Possibili duplicati.");
        return;
      }

      onDone?.();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ragione sociale *">
          <Input
            value={form.legalName}
            onChange={(e) => update("legalName", e.target.value)}
            required
          />
        </Field>
        <Field label="Nome commerciale">
          <Input
            value={form.tradeName}
            onChange={(e) => update("tradeName", e.target.value)}
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
          />
        </Field>
        <Field label="Email aziendale">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Telefono">
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Sito web">
          <Input
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="Fonte contatto">
          <Input
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
            placeholder="LinkedIn, referral, fiera…"
          />
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
        <Field label="Dimensione stimata">
          <Input
            value={form.companySizeEstimate}
            onChange={(e) => update("companySizeEstimate", e.target.value)}
            placeholder="es. 1–5, 6–20"
          />
        </Field>
        <Field label="Servizio di interesse">
          <Input
            value={form.interestedService}
            onChange={(e) => update("interestedService", e.target.value)}
          />
        </Field>
        <Field label="Stato commerciale">
          <select
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.qualificationStatus}
            onChange={(e) =>
              update(
                "qualificationStatus",
                e.target.value as FormState["qualificationStatus"],
              )
            }
          >
            {QUALIFICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {QUALIFICATION_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priorità">
          <select
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={form.commercialPriority}
            onChange={(e) =>
              update(
                "commercialPriority",
                e.target.value as FormState["commercialPriority"],
              )
            }
          >
            {COMMERCIAL_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data verifica">
          <Input
            type="date"
            value={form.verifiedAt}
            onChange={(e) => update("verifiedAt", e.target.value)}
          />
        </Field>
        <Field label="Promemoria ricontatto">
          <Input
            type="datetime-local"
            value={form.followUpAt}
            onChange={(e) => update("followUpAt", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Note">
        <textarea
          className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </Field>

      <p className="text-xs text-foreground-muted">
        L&apos;email aziendale non implica consenso marketing. Nessuna
        comunicazione promozionale automatica.
      </p>

      {duplicates.length > 0 ? (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
          <p className="font-medium">Possibili duplicati (revisione manuale)</p>
          <ul className="mt-2 space-y-1 text-foreground-muted">
            {duplicates.map((d) => (
              <li key={d.existingId}>
                {d.existingName} — {d.reasons.join(", ")}
              </li>
            ))}
          </ul>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
            />
            Salva comunque e segnala per revisione (nessuna eliminazione
            automatica)
          </label>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annulla
          </Button>
        ) : null}
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Salvataggio…" : prospect ? "Aggiorna" : "Crea prospect"}
        </Button>
      </div>
    </div>
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
