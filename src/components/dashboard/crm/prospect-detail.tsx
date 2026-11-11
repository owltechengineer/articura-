"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addInteractionAction,
  convertProspectToClientAction,
  markDuplicateReviewedAction,
  softDeleteProspectAction,
  updateProspectStatusAction,
} from "@/app/actions/crm";
import { ProspectForm } from "@/components/dashboard/crm/prospect-form";
import {
  formatDateIT,
  formatDateTimeIT,
  priorityLabel,
  qualificationLabel,
} from "@/components/dashboard/crm/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  QUALIFICATION_LABELS,
  QUALIFICATION_STATUSES,
  type ProspectRecord,
  type QualificationStatus,
} from "@/lib/crm/types";

type Interaction = {
  id: string;
  type: string;
  summary: string;
  occurred_at: string;
  created_at: string;
};

type Props = {
  prospect: ProspectRecord;
  interactions: Interaction[];
  linkedQuotes: { id: string; request_number: string; status: string }[];
  linkedProjects: { id: string; name: string; status: string }[];
};

export function ProspectDetail({
  prospect,
  interactions,
  linkedQuotes,
  linkedProjects,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Operazione non riuscita");
        return;
      }
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/crm"
            className="text-xs text-foreground-muted hover:text-accent"
          >
            ← Torna al CRM
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {prospect.legalName}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{qualificationLabel(prospect.qualificationStatus)}</Badge>
            <Badge variant="secondary">
              {priorityLabel(prospect.commercialPriority)}
            </Badge>
            <Badge variant="outline">
              {prospect.status === "prospect"
                ? "Prospect"
                : prospect.status === "active_client"
                  ? "Cliente attivo"
                  : "Ex cliente"}
            </Badge>
            {prospect.duplicateGroupId ? (
              <Badge variant="warning">Duplicato da rivedere</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "Chiudi modifica" : "Modifica"}
          </Button>
          {prospect.status === "prospect" ? (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() =>
                run(() => convertProspectToClientAction(prospect.id))
              }
            >
              Converti in cliente
            </Button>
          ) : null}
          {prospect.duplicateGroupId ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                run(() => markDuplicateReviewedAction(prospect.id))
              }
            >
              Segna duplicato rivisto
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => {
              if (
                !window.confirm(
                  "Archiviare questo prospect? (soft delete, nessun invio email)",
                )
              ) {
                return;
              }
              setError(null);
              startTransition(async () => {
                const result = await softDeleteProspectAction(prospect.id);
                if (!result.ok) {
                  setError(result.error ?? "Operazione non riuscita");
                  return;
                }
                router.push("/dashboard/crm");
                router.refresh();
              });
            }}
          >
            Archivia
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {editing ? (
        <div className="rounded-lg border border-border p-4">
          <ProspectForm
            prospect={prospect}
            onCancel={() => setEditing(false)}
            onDone={() => {
              setEditing(false);
              refresh();
            }}
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 rounded-lg border border-border p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold">Anagrafica</h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <Item label="Email" value={prospect.email} />
              <Item label="Telefono" value={prospect.phone} />
              <Item label="Sito" value={prospect.website} />
              <Item label="Dominio" value={prospect.websiteDomain} />
              <Item label="P. IVA" value={prospect.vatNumber} />
              <Item label="Settore" value={prospect.sector} />
              <Item
                label="Comune"
                value={[prospect.city, prospect.province]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <Item label="Fonte" value={prospect.source} />
              <Item
                label="Verificato"
                value={formatDateIT(prospect.verifiedAt)}
              />
              <Item
                label="Dimensione"
                value={prospect.companySizeEstimate}
              />
              <Item
                label="Servizio interesse"
                value={prospect.interestedService}
              />
              <Item
                label="Follow-up"
                value={formatDateTimeIT(prospect.followUpAt)}
              />
            </dl>
            {prospect.notes ? (
              <div>
                <p className="text-xs text-foreground-muted">Note</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {prospect.notes}
                </p>
              </div>
            ) : null}
            <p className="text-xs text-foreground-muted">
              Contatto aziendale ≠ consenso marketing. Nessuna email
              promozionale automatica.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">Pipeline</h2>
            <Label>Stato commerciale</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={prospect.qualificationStatus}
              disabled={pending}
              onChange={(e) =>
                run(() =>
                  updateProspectStatusAction(
                    prospect.id,
                    e.target.value as QualificationStatus,
                  ),
                )
              }
            >
              {QUALIFICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {QUALIFICATION_LABELS[s]}
                </option>
              ))}
            </select>

            <div className="pt-2">
              <h3 className="text-xs font-medium text-foreground-muted">
                Preventivi collegati
              </h3>
              {linkedQuotes.length === 0 ? (
                <p className="mt-1 text-sm text-foreground-muted">Nessuno</p>
              ) : (
                <ul className="mt-1 space-y-1 text-sm">
                  {linkedQuotes.map((q) => (
                    <li key={q.id}>
                      <Link
                        href="/dashboard/preventivi"
                        className="hover:text-accent"
                      >
                        {q.request_number}
                      </Link>{" "}
                      <span className="text-foreground-muted">({q.status})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-xs font-medium text-foreground-muted">
                Progetti collegati
              </h3>
              {linkedProjects.length === 0 ? (
                <p className="mt-1 text-sm text-foreground-muted">Nessuno</p>
              ) : (
                <ul className="mt-1 space-y-1 text-sm">
                  {linkedProjects.map((p) => (
                    <li key={p.id}>
                      {p.name}{" "}
                      <span className="text-foreground-muted">({p.status})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold">Storico interazioni</h2>
        <div className="mt-3 flex gap-2">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Aggiungi nota / esito contatto…"
          />
          <Button
            type="button"
            disabled={pending || note.trim().length < 2}
            onClick={() =>
              run(async () => {
                const result = await addInteractionAction({
                  organizationId: prospect.id,
                  summary: note.trim(),
                  type: "note",
                });
                if (result.ok) setNote("");
                return result;
              })
            }
          >
            Aggiungi
          </Button>
        </div>
        <ul className="mt-4 space-y-3">
          {interactions.length === 0 ? (
            <li className="text-sm text-foreground-muted">
              Nessuna interazione registrata.
            </li>
          ) : (
            interactions.map((item) => (
              <li
                key={item.id}
                className="border-t border-border pt-3 text-sm first:border-0 first:pt-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{item.type}</Badge>
                  <span className="text-xs text-foreground-muted">
                    {formatDateTimeIT(item.occurred_at)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{item.summary}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs text-foreground-muted">{label}</dt>
      <dd className="mt-0.5">{value || "—"}</dd>
    </div>
  );
}
