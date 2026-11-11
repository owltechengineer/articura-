"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteFundingDocumentAction,
  softDeleteFundingAction,
  toggleFundingDocumentDoneAction,
  upsertFundingDocumentAction,
  upsertFundingAction,
} from "@/app/actions/funding";
import { upsertTaskAction } from "@/app/actions/plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FUNDING_STATUS_LABELS,
  isOfficiallyVerifiedOpen,
  type FundingDocument,
  type FundingOpportunity,
  type FundingStatus,
  FUNDING_STATUSES,
} from "@/lib/funding/types";

type LinkedTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  progress_percent: number;
};

type Props = {
  funding: FundingOpportunity;
  documents: FundingDocument[];
  tasks: LinkedTask[];
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

export function FundingDetail({ funding, documents, tasks }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [status, setStatus] = useState<FundingStatus>(funding.status);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(
    funding.lastVerifiedAt ?? "",
  );

  const openCheck = isOfficiallyVerifiedOpen({
    ...funding,
    status,
    lastVerifiedAt: lastVerifiedAt || null,
  });

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/bandi"
          className="text-xs text-foreground-muted hover:text-accent"
        >
          ← Torna ai bandi
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {funding.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{FUNDING_STATUS_LABELS[status]}</Badge>
              {openCheck.open ? (
                <Badge variant="success">Verificato aperto</Badge>
              ) : (
                <Badge variant="warning">Non attestato come aperto</Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-foreground-muted">
              {openCheck.reason}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await softDeleteFundingAction(funding.id);
                router.push("/dashboard/bandi");
              })
            }
          >
            Archivia
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-lg border border-border p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Dettaglio</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <Item label="Ente" value={funding.promoter} />
            <Item
              label="Territorio"
              value={[funding.region, funding.territory]
                .filter(Boolean)
                .join(" · ")}
            />
            <Item label="Tipo agevolazione" value={funding.aidType} />
            <Item
              label="Contributo max"
              value={
                funding.maxContributionEur == null
                  ? null
                  : `€ ${funding.maxContributionEur}`
              }
            />
            <Item
              label="% finanziabile"
              value={
                funding.fundingPercent == null
                  ? null
                  : `${funding.fundingPercent}%`
              }
            />
            <Item
              label="Investimento min"
              value={
                funding.minInvestmentEur == null
                  ? null
                  : `€ ${funding.minInvestmentEur}`
              }
            />
            <Item label="Apertura" value={formatDate(funding.opensOn)} />
            <Item label="Chiusura" value={formatDate(funding.closesOn)} />
            <Item
              label="Promemoria"
              value={formatDate(funding.reminderAt)}
            />
            <Item
              label="URL ufficiale"
              value={funding.officialUrl}
              href={funding.officialUrl}
            />
          </dl>
          {funding.eligibilityRequirements ? (
            <div>
              <p className="text-xs text-foreground-muted">Requisiti</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {funding.eligibilityRequirements}
              </p>
            </div>
          ) : null}
          {funding.notes ? (
            <div>
              <p className="text-xs text-foreground-muted">Note</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{funding.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Verifica e stato</h2>
          <Field label="Stato">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={status}
              disabled={pending}
              onChange={(e) => {
                const next = e.target.value as FundingStatus;
                setStatus(next);
                startTransition(async () => {
                  const result = await upsertFundingAction({
                    id: funding.id,
                    name: funding.name,
                    promoter: funding.promoter,
                    region: funding.region,
                    territory: funding.territory,
                    officialUrl: funding.officialUrl,
                    aidType: funding.aidType,
                    maxContributionEur: funding.maxContributionEur,
                    fundingPercent: funding.fundingPercent,
                    minInvestmentEur: funding.minInvestmentEur,
                    eligibilityRequirements: funding.eligibilityRequirements,
                    opensOn: funding.opensOn,
                    closesOn: funding.closesOn,
                    lastVerifiedAt: lastVerifiedAt || null,
                    status: next,
                    reminderAt: funding.reminderAt,
                    notes: funding.notes,
                    ownerId: funding.ownerId,
                    organizationId: funding.organizationId,
                  });
                  if (!result.ok) setError(result.error ?? "Errore");
                  else refresh();
                });
              }}
            >
              {FUNDING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {FUNDING_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ultima verifica ufficiale">
            <Input
              type="date"
              value={lastVerifiedAt}
              onChange={(e) => setLastVerifiedAt(e.target.value)}
            />
          </Field>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const today = new Date().toISOString().slice(0, 10);
                setLastVerifiedAt(today);
                const result = await upsertFundingAction({
                  id: funding.id,
                  name: funding.name,
                  promoter: funding.promoter,
                  region: funding.region,
                  territory: funding.territory,
                  officialUrl: funding.officialUrl,
                  aidType: funding.aidType,
                  maxContributionEur: funding.maxContributionEur,
                  fundingPercent: funding.fundingPercent,
                  minInvestmentEur: funding.minInvestmentEur,
                  eligibilityRequirements: funding.eligibilityRequirements,
                  opensOn: funding.opensOn,
                  closesOn: funding.closesOn,
                  lastVerifiedAt: today,
                  status,
                  reminderAt: funding.reminderAt,
                  notes: funding.notes,
                  ownerId: funding.ownerId,
                  organizationId: funding.organizationId,
                });
                if (!result.ok) setError(result.error ?? "Errore");
                else refresh();
              })
            }
          >
            Segna verificato oggi
          </Button>
          <p className="text-xs text-foreground-muted">
            Conferma solo dopo controllo sulla fonte ufficiale.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Checklist documenti</h2>
          <ul className="mt-3 space-y-2">
            {documents.length === 0 ? (
              <li className="text-sm text-foreground-muted">
                Nessun documento in checklist.
              </li>
            ) : (
              documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={doc.isDone}
                      disabled={pending}
                      onChange={(e) =>
                        startTransition(async () => {
                          await toggleFundingDocumentDoneAction(
                            doc.id,
                            funding.id,
                            e.target.checked,
                          );
                          refresh();
                        })
                      }
                    />
                    <span>
                      <span className={doc.isDone ? "line-through" : ""}>
                        {doc.title}
                      </span>
                      {doc.isRequired ? (
                        <Badge variant="outline" className="ml-2">
                          obbligatorio
                        </Badge>
                      ) : null}
                      {doc.dueOn ? (
                        <span className="mt-1 block text-xs text-foreground-muted">
                          Scad. {formatDate(doc.dueOn)}
                        </span>
                      ) : null}
                    </span>
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteFundingDocumentAction(doc.id, funding.id);
                        refresh();
                      })
                    }
                  >
                    ×
                  </Button>
                </li>
              ))
            )}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Documento richiesto"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={pending || docTitle.trim().length < 2}
              onClick={() =>
                startTransition(async () => {
                  const result = await upsertFundingDocumentAction({
                    fundingId: funding.id,
                    title: docTitle.trim(),
                    isRequired: true,
                  });
                  if (!result.ok) {
                    setError(result.error ?? "Errore");
                    return;
                  }
                  setDocTitle("");
                  refresh();
                })
              }
            >
              Aggiungi
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Attività collegate</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {tasks.length === 0 ? (
              <li className="text-foreground-muted">Nessuna attività.</li>
            ) : (
              tasks.map((task) => (
                <li key={task.id} className="border-t border-border pt-2">
                  <Link href="/dashboard/attivita" className="hover:text-accent">
                    {task.title}
                  </Link>
                  <div className="text-xs text-foreground-muted">
                    {task.status} · {task.progress_percent}%
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Nuova attività sul bando"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={pending || taskTitle.trim().length < 2}
              onClick={() =>
                startTransition(async () => {
                  const result = await upsertTaskAction({
                    title: taskTitle.trim(),
                    fundingId: funding.id,
                    organizationId: funding.organizationId,
                    status: "todo",
                    priority: "medium",
                  });
                  if (!result.ok) {
                    setError(result.error ?? "Errore");
                    return;
                  }
                  setTaskTitle("");
                  refresh();
                })
              }
            >
              Aggiungi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null | undefined;
  href?: string | null;
}) {
  return (
    <div>
      <dt className="text-xs text-foreground-muted">{label}</dt>
      <dd className="mt-0.5">
        {href && value ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            {value}
          </a>
        ) : (
          value || "—"
        )}
      </dd>
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
