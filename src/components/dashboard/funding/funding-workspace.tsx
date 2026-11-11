"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import {
  softDeleteFundingAction,
  upsertFundingAction,
} from "@/app/actions/funding";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FUNDING_STATUSES,
  FUNDING_STATUS_LABELS,
  isOfficiallyVerifiedOpen,
  type FundingOpportunity,
  type FundingStatus,
} from "@/lib/funding/types";

type Props = {
  items: FundingOpportunity[];
};

type FormState = {
  name: string;
  promoter: string;
  region: string;
  territory: string;
  officialUrl: string;
  aidType: string;
  maxContributionEur: string;
  fundingPercent: string;
  minInvestmentEur: string;
  eligibilityRequirements: string;
  opensOn: string;
  closesOn: string;
  lastVerifiedAt: string;
  status: FundingStatus;
  reminderAt: string;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  promoter: "",
  region: "",
  territory: "",
  officialUrl: "",
  aidType: "",
  maxContributionEur: "",
  fundingPercent: "",
  minInvestmentEur: "",
  eligibilityRequirements: "",
  opensOn: "",
  closesOn: "",
  lastVerifiedAt: "",
  status: "to_verify",
  reminderAt: "",
  notes: "",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Rome",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value));
}

function money(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FundingWorkspace({ items }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FundingStatus | "all">(
    "all",
  );
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      return [item.name, item.promoter, item.region, item.aidType]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, query, statusFilter]);

  const reminders = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      if (!item.reminderAt) return false;
      const t = new Date(item.reminderAt).getTime();
      return Number.isFinite(t) && t <= now + 7 * 24 * 60 * 60 * 1000;
    });
  }, [items]);

  const closingSoon = useMemo(() => {
    const limit = Date.now() + 21 * 24 * 60 * 60 * 1000;
    return items.filter((item) => {
      if (!item.closesOn) return false;
      if (item.status === "closed" || item.status === "rejected") return false;
      const t = new Date(`${item.closesOn}T23:59:59`).getTime();
      return t <= limit;
    });
  }, [items]);

  function openCreate() {
    setEditingId(undefined);
    setForm(emptyForm);
    setOpen(true);
    setError(null);
  }

  function openEdit(item: FundingOpportunity) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      promoter: item.promoter ?? "",
      region: item.region ?? "",
      territory: item.territory ?? "",
      officialUrl: item.officialUrl ?? "",
      aidType: item.aidType ?? "",
      maxContributionEur:
        item.maxContributionEur == null ? "" : String(item.maxContributionEur),
      fundingPercent:
        item.fundingPercent == null ? "" : String(item.fundingPercent),
      minInvestmentEur:
        item.minInvestmentEur == null ? "" : String(item.minInvestmentEur),
      eligibilityRequirements: item.eligibilityRequirements ?? "",
      opensOn: item.opensOn ?? "",
      closesOn: item.closesOn ?? "",
      lastVerifiedAt: item.lastVerifiedAt ?? "",
      status: item.status,
      reminderAt: item.reminderAt
        ? new Date(
            new Date(item.reminderAt).getTime() -
              new Date(item.reminderAt).getTimezoneOffset() * 60_000,
          )
            .toISOString()
            .slice(0, 16)
        : "",
      notes: item.notes ?? "",
    });
    setOpen(true);
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertFundingAction({
        id: editingId,
        name: form.name,
        promoter: form.promoter || null,
        region: form.region || null,
        territory: form.territory || null,
        officialUrl: form.officialUrl || null,
        aidType: form.aidType || null,
        maxContributionEur: form.maxContributionEur
          ? Number(form.maxContributionEur)
          : null,
        fundingPercent: form.fundingPercent
          ? Number(form.fundingPercent)
          : null,
        minInvestmentEur: form.minInvestmentEur
          ? Number(form.minInvestmentEur)
          : null,
        eligibilityRequirements: form.eligibilityRequirements || null,
        opensOn: form.opensOn || null,
        closesOn: form.closesOn || null,
        lastVerifiedAt: form.lastVerifiedAt || null,
        status: form.status,
        reminderAt: form.reminderAt
          ? new Date(form.reminderAt).toISOString()
          : null,
        notes: form.notes || null,
      });
      if (!result.ok) {
        setError(result.error ?? "Errore");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background-secondary/40 p-3 text-sm text-foreground-muted">
        Un bando non viene mai mostrato come «aperto» senza URL ufficiale e
        verifica aggiornata. Nessuno scraping o monitoraggio automatico.
      </div>

      {(reminders.length > 0 || closingSoon.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {reminders.length > 0 ? (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
              <p className="font-medium">Promemoria scadenze</p>
              <ul className="mt-2 space-y-1 text-foreground-muted">
                {reminders.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/bandi/${item.id}`}
                      className="hover:text-accent"
                    >
                      {item.name}
                    </Link>{" "}
                    · {formatDate(item.reminderAt)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {closingSoon.length > 0 ? (
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">Chiusura entro 21 giorni</p>
              <ul className="mt-2 space-y-1 text-foreground-muted">
                {closingSoon.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/bandi/${item.id}`}
                      className="hover:text-accent"
                    >
                      {item.name}
                    </Link>{" "}
                    · {formatDate(item.closesOn)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            className="max-w-sm"
            placeholder="Cerca bando, ente, regione…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as FundingStatus | "all")
            }
          >
            <option value="all">Tutti gli stati</option>
            {FUNDING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {FUNDING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus /> Nuovo bando
        </Button>
      </div>

      {open ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold">
            {editingId ? "Modifica bando" : "Nuovo bando"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome *">
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Ente promotore">
              <Input
                value={form.promoter}
                onChange={(e) =>
                  setForm((f) => ({ ...f, promoter: e.target.value }))
                }
              />
            </Field>
            <Field label="Regione">
              <Input
                value={form.region}
                onChange={(e) =>
                  setForm((f) => ({ ...f, region: e.target.value }))
                }
              />
            </Field>
            <Field label="Territorio">
              <Input
                value={form.territory}
                onChange={(e) =>
                  setForm((f) => ({ ...f, territory: e.target.value }))
                }
              />
            </Field>
            <Field label="URL ufficiale">
              <Input
                value={form.officialUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, officialUrl: e.target.value }))
                }
                placeholder="https://"
              />
            </Field>
            <Field label="Tipo agevolazione">
              <Input
                value={form.aidType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, aidType: e.target.value }))
                }
              />
            </Field>
            <Field label="Contributo massimo (€)">
              <Input
                value={form.maxContributionEur}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxContributionEur: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="% finanziabile">
              <Input
                value={form.fundingPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fundingPercent: e.target.value }))
                }
              />
            </Field>
            <Field label="Investimento minimo (€)">
              <Input
                value={form.minInvestmentEur}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minInvestmentEur: e.target.value }))
                }
              />
            </Field>
            <Field label="Stato">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as FundingStatus,
                  }))
                }
              >
                {FUNDING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {FUNDING_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Apertura">
              <Input
                type="date"
                value={form.opensOn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, opensOn: e.target.value }))
                }
              />
            </Field>
            <Field label="Chiusura">
              <Input
                type="date"
                value={form.closesOn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, closesOn: e.target.value }))
                }
              />
            </Field>
            <Field label="Ultima verifica ufficiale">
              <Input
                type="date"
                value={form.lastVerifiedAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastVerifiedAt: e.target.value }))
                }
              />
            </Field>
            <Field label="Promemoria">
              <Input
                type="datetime-local"
                value={form.reminderAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reminderAt: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Requisiti di ammissibilità">
            <textarea
              className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.eligibilityRequirements}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  eligibilityRequirements: e.target.value,
                }))
              }
            />
          </Field>
          <Field label="Note">
            <textarea
              className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </Field>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="button" disabled={pending} onClick={save}>
              Salva
            </Button>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Nessun bando"
          description="Inserisci opportunità da fonti ufficiali. Nessun dato dimostrativo."
          action={
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus /> Aggiungi bando
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background-secondary text-foreground-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Bando</th>
                <th className="px-3 py-2 font-medium">Stato</th>
                <th className="px-3 py-2 font-medium">Aperto?</th>
                <th className="px-3 py-2 font-medium">Chiusura</th>
                <th className="px-3 py-2 font-medium">Contributo</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const openCheck = isOfficiallyVerifiedOpen(item);
                return (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <Link
                        href={`/dashboard/bandi/${item.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <div className="text-xs text-foreground-muted">
                        {[item.promoter, item.region || item.territory]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">
                        {FUNDING_STATUS_LABELS[item.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      {openCheck.open ? (
                        <Badge variant="success">Verificato aperto</Badge>
                      ) : (
                        <span className="text-xs text-foreground-muted">
                          No — {openCheck.reason}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {formatDate(item.closesOn)}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {money(item.maxContributionEur)}
                      {item.fundingPercent != null
                        ? ` · ${item.fundingPercent}%`
                        : ""}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(item)}
                        >
                          Modifica
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              await softDeleteFundingAction(item.id);
                              router.refresh();
                            })
                          }
                        >
                          Archivia
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
