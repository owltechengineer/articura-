"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { importProspectsAction } from "@/app/actions/crm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  IMPORT_FIELD_OPTIONS,
  mapRowsToProspects,
  parseSpreadsheet,
  suggestColumnMapping,
  type ImportFieldKey,
} from "@/lib/crm/import";

type Props = {
  onClose: () => void;
};

export function ProspectImport({ onClose }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, ImportFieldKey | "">>(
    {},
  );
  const [previewErrors, setPreviewErrors] = useState<
    { row: number; message: string }[]
  >([]);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    setError(null);
    setResultMsg(null);
    if (!file) return;
    try {
      const parsed = await parseSpreadsheet(file);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setMapping(suggestColumnMapping(parsed.headers));
      setPreviewErrors([]);
    } catch {
      setError("Impossibile leggere il file. Usa CSV o XLSX.");
    }
  }

  function runImport(forceDuplicates = false) {
    setError(null);
    const mapped = mapRowsToProspects(rows, mapping);
    setPreviewErrors(mapped.errors);

    if (mapped.valid.length === 0) {
      setError("Nessuna riga valida da importare.");
      return;
    }

    startTransition(async () => {
      const payload = mapped.valid.map((row) => ({
        ...row,
        forceSaveDespiteDuplicates: forceDuplicates,
      }));
      const result = await importProspectsAction(payload);
      if (!result.ok) {
        setError(result.error ?? "Import fallito");
        return;
      }
      setResultMsg(
        `Importati ${result.imported ?? 0}. Saltati ${result.skipped ?? 0}.`,
      );
      if (result.errors?.length) {
        setPreviewErrors(result.errors);
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Import CSV / Excel</h3>
          <p className="mt-1 text-xs text-foreground-muted">
            Anteprima e mappatura colonne obbligatorie. I duplicati non vengono
            eliminati: vengono segnalati e saltati, salvo forzatura.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Chiudi
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="crm-import-file">File</Label>
        <input
          id="crm-import-file"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="block w-full text-sm"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {headers.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-foreground-muted">
            {rows.length} righe lette. Mappa almeno «Ragione sociale».
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {headers.map((header) => (
              <div key={header} className="space-y-1">
                <Label className="text-xs">{header}</Label>
                <select
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  value={mapping[header] ?? ""}
                  onChange={(e) =>
                    setMapping((prev) => ({
                      ...prev,
                      [header]: e.target.value as ImportFieldKey | "",
                    }))
                  }
                >
                  <option value="">— ignora —</option>
                  {IMPORT_FIELD_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-background-secondary text-foreground-muted">
                <tr>
                  {headers.slice(0, 6).map((h) => (
                    <th key={h} className="px-2 py-1.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {headers.slice(0, 6).map((h) => (
                      <td key={h} className="px-2 py-1.5">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {previewErrors.length > 0 ? (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2 text-xs text-foreground-muted">
          {previewErrors.slice(0, 30).map((err) => (
            <div key={`${err.row}-${err.message}`}>
              Riga {err.row}: {err.message}
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {resultMsg ? <p className="text-sm text-success">{resultMsg}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => runImport(false)}
          disabled={pending || rows.length === 0}
        >
          {pending ? "Import in corso…" : "Importa (salta duplicati)"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => runImport(true)}
          disabled={pending || rows.length === 0}
        >
          Importa e segnala duplicati
        </Button>
      </div>
    </div>
  );
}
