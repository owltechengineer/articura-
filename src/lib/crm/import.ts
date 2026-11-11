import Papa from "papaparse";
import * as XLSX from "xlsx";

import { prospectUpsertSchema } from "@/lib/crm/validations";
import type { ProspectUpsertInput } from "@/lib/crm/validations";

export const IMPORT_FIELD_OPTIONS = [
  { key: "legalName", label: "Ragione sociale *" },
  { key: "tradeName", label: "Nome commerciale" },
  { key: "vatNumber", label: "Partita IVA" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefono" },
  { key: "website", label: "Sito web" },
  { key: "sector", label: "Settore" },
  { key: "city", label: "Comune" },
  { key: "province", label: "Provincia" },
  { key: "source", label: "Fonte" },
  { key: "companySizeEstimate", label: "Dimensione stimata" },
  { key: "interestedService", label: "Servizio di interesse" },
  { key: "notes", label: "Note" },
] as const;

export type ImportFieldKey = (typeof IMPORT_FIELD_OPTIONS)[number]["key"];

const HEADER_ALIASES: Record<string, ImportFieldKey> = {
  "ragione sociale": "legalName",
  azienda: "legalName",
  company: "legalName",
  name: "legalName",
  "nome commerciale": "tradeName",
  "partita iva": "vatNumber",
  piva: "vatNumber",
  vat: "vatNumber",
  email: "email",
  "e-mail": "email",
  telefono: "phone",
  phone: "phone",
  sito: "website",
  website: "website",
  settore: "sector",
  sector: "sector",
  comune: "city",
  city: "city",
  provincia: "province",
  fonte: "source",
  source: "source",
  dimensione: "companySizeEstimate",
  servizio: "interestedService",
  note: "notes",
  notes: "notes",
};

export function suggestColumnMapping(headers: string[]): Record<string, ImportFieldKey | ""> {
  const mapping: Record<string, ImportFieldKey | ""> = {};
  for (const header of headers) {
    const normalized = header.trim().toLowerCase();
    mapping[header] = HEADER_ALIASES[normalized] ?? "";
  }
  return mapping;
}

export async function parseSpreadsheet(file: File): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  const buffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const text = new TextDecoder("utf-8").decode(buffer);
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    const headers = parsed.meta.fields ?? [];
    return { headers, rows: parsed.data };
  }

  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { headers: [], rows: [] };
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

export function mapRowsToProspects(
  rows: Record<string, string>[],
  mapping: Record<string, ImportFieldKey | "">,
): {
  valid: ProspectUpsertInput[];
  errors: { row: number; message: string }[];
} {
  const valid: ProspectUpsertInput[] = [];
  const errors: { row: number; message: string }[] = [];

  rows.forEach((row, index) => {
    const payload: Record<string, string> = {};
    for (const [header, field] of Object.entries(mapping)) {
      if (!field) continue;
      payload[field] = String(row[header] ?? "").trim();
    }

    const parsed = prospectUpsertSchema.safeParse({
      ...payload,
      email: payload.email || null,
      qualificationStatus: "new",
      commercialPriority: "medium",
      forceSaveDespiteDuplicates: false,
    });

    if (!parsed.success) {
      errors.push({
        row: index + 2,
        message: parsed.error.issues[0]?.message ?? "Riga non valida",
      });
      return;
    }

    valid.push(parsed.data);
  });

  return { valid, errors };
}

export function prospectsToCsv(rows: Array<Record<string, string | null>>): string {
  return Papa.unparse(rows);
}

export function prospectsToXlsxArrayBuffer(
  rows: Array<Record<string, string | null>>,
): ArrayBuffer {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Prospect");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
