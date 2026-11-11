# FASE A — CRM Prospect, import Excel, pipeline commerciale

## Cosa è stato implementato

- Estensione della tabella `organizations` (anagrafica unica prospect → cliente).
- Campi commerciali: fonte, verifica, dimensione, stato qualificazione, servizio di interesse, priorità, follow-up, dominio, segnalazione duplicati.
- Storico interazioni: `organization_interactions`.
- UI `/dashboard/crm`: tabella, Kanban drag&drop, form, dettaglio, import CSV/XLSX con anteprima e mappatura, export CSV/XLSX.
- `/dashboard/clienti` elenca solo anagrafiche non-prospect (stessa tabella).
- Controllo duplicati (P.IVA, email, dominio, ragione sociale/comune) con revisione manuale — nessuna eliminazione automatica.
- Nessuna email promozionale automatica; disclaimer consenso marketing in UI.

## Configurazione richiesta

1. In Supabase SQL Editor eseguire:
   - `supabase/migrations/APPLY_NOW_crm_phase_a.sql`
2. Verificare login staff su `/login`.
3. Aprire `/dashboard/crm` e creare o importare prospect.

## File principali

- Migrazione: `supabase/migrations/APPLY_NOW_crm_phase_a.sql`
- Actions: `src/app/actions/crm.ts`
- Lib: `src/lib/crm/*`
- UI: `src/components/dashboard/crm/*`
- Pagine: `src/app/(dashboard)/dashboard/crm/*`, `.../clienti/page.tsx`
- Tipi DB: `src/types/database.ts`
- Dipendenze: `papaparse`, `xlsx`

## Non incluso (fasi successive)

- B Piano operativo, C Social, D Bandi, E KPI integrati.
- Pubblicazione automatica social / scraping bandi.

## Test

```bash
npx vitest run src/lib/crm/duplicates.test.ts
npm run build
```
