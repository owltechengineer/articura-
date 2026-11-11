"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Download, LayoutGrid, List, Plus, Upload } from "lucide-react";

import { ProspectForm } from "@/components/dashboard/crm/prospect-form";
import { ProspectImport } from "@/components/dashboard/crm/prospect-import";
import { ProspectKanban } from "@/components/dashboard/crm/prospect-kanban";
import {
  formatDateIT,
  formatDateTimeIT,
  priorityLabel,
  qualificationLabel,
} from "@/components/dashboard/crm/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  prospectsToCsv,
  prospectsToXlsxArrayBuffer,
} from "@/lib/crm/import";
import {
  QUALIFICATION_LABELS,
  QUALIFICATION_STATUSES,
  type ProspectRecord,
  type QualificationStatus,
} from "@/lib/crm/types";

type Props = {
  prospects: ProspectRecord[];
};

type ViewMode = "table" | "kanban";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function CrmWorkspace({ prospects }: Props) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("table");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QualificationStatus | "all">(
    "all",
  );
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prospects.filter((p) => {
      if (statusFilter !== "all" && p.qualificationStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return [
        p.legalName,
        p.tradeName,
        p.email,
        p.city,
        p.sector,
        p.vatNumber,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [prospects, query, statusFilter]);

  const duplicateCount = prospects.filter((p) => p.duplicateGroupId).length;

  function exportRows(format: "csv" | "xlsx") {
    const rows = filtered.map((p) => ({
      "Ragione sociale": p.legalName,
      "Nome commerciale": p.tradeName,
      "Partita IVA": p.vatNumber,
      Email: p.email,
      Telefono: p.phone,
      "Sito web": p.website,
      Settore: p.sector,
      Comune: p.city,
      Provincia: p.province,
      Fonte: p.source,
      "Dimensione stimata": p.companySizeEstimate,
      Stato: QUALIFICATION_LABELS[p.qualificationStatus],
      Priorità: priorityLabel(p.commercialPriority),
      "Servizio interesse": p.interestedService,
      "Follow-up": p.followUpAt,
      Note: p.notes,
    }));

    if (format === "csv") {
      const csv = prospectsToCsv(rows);
      downloadBlob(
        `articura-prospect-${new Date().toISOString().slice(0, 10)}.csv`,
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      return;
    }

    const buffer = prospectsToXlsxArrayBuffer(rows);
    downloadBlob(
      `articura-prospect-${new Date().toISOString().slice(0, 10)}.xlsx`,
      new Blob([new Uint8Array(buffer)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca ragione sociale, email, comune…"
            className="max-w-sm"
          />
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as QualificationStatus | "all")
            }
          >
            <option value="all">Tutti gli stati</option>
            {QUALIFICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {QUALIFICATION_LABELS[s]}
              </option>
            ))}
          </select>
          {duplicateCount > 0 ? (
            <Badge variant="warning">{duplicateCount} da rivedere</Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border">
            <Button
              type="button"
              size="sm"
              variant={view === "table" ? "secondary" : "ghost"}
              onClick={() => setView("table")}
            >
              <List /> Tabella
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "kanban" ? "secondary" : "ghost"}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid /> Kanban
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowImport((v) => !v)}
          >
            <Upload /> Importa
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => exportRows("csv")}
          >
            <Download /> CSV
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => exportRows("xlsx")}
          >
            <Download /> Excel
          </Button>
          <Button type="button" size="sm" onClick={() => setShowForm(true)}>
            <Plus /> Nuovo
          </Button>
        </div>
      </div>

      {showImport ? (
        <ProspectImport onClose={() => setShowImport(false)} />
      ) : null}

      {showForm ? (
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">Nuovo prospect</h3>
          <ProspectForm
            onCancel={() => setShowForm(false)}
            onDone={() => {
              setShowForm(false);
              router.refresh();
            }}
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Nessun prospect"
          description="Inserisci manualmente un’azienda o importa un CSV/Excel. Nessun dato dimostrativo."
          action={
            <Button type="button" size="sm" onClick={() => setShowForm(true)}>
              <Plus /> Aggiungi prospect
            </Button>
          }
        />
      ) : view === "kanban" ? (
        <ProspectKanban prospects={filtered} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background-secondary text-foreground-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Azienda</th>
                <th className="px-3 py-2 font-medium">Contatti</th>
                <th className="px-3 py-2 font-medium">Stato</th>
                <th className="px-3 py-2 font-medium">Priorità</th>
                <th className="px-3 py-2 font-medium">Follow-up</th>
                <th className="px-3 py-2 font-medium">Aggiornato</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-3">
                    <Link
                      href={`/dashboard/crm/${p.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {p.legalName}
                    </Link>
                    <div className="text-xs text-foreground-muted">
                      {[p.city, p.sector].filter(Boolean).join(" · ") || "—"}
                    </div>
                    {p.duplicateGroupId ? (
                      <Badge variant="warning" className="mt-1">
                        Duplicato da rivedere
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div>{p.email || "—"}</div>
                    <div className="text-foreground-muted">{p.phone || "—"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="outline">
                      {qualificationLabel(p.qualificationStatus)}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {priorityLabel(p.commercialPriority)}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {formatDateIT(p.followUpAt)}
                  </td>
                  <td className="px-3 py-3 text-xs text-foreground-muted">
                    {formatDateTimeIT(p.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
