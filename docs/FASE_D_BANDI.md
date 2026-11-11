# FASE D — Bandi e finanziamenti

## Cosa è stato implementato

- Tabelle `funding_opportunities` e `funding_documents` (checklist).
- Colonna `tasks.funding_id` per attività collegate (riuso tasks).
- UI `/dashboard/bandi` + dettaglio `/dashboard/bandi/[id]`.
- Promemoria scadenze e chiusure imminenti.
- Flag «Verificato aperto» solo con URL ufficiale + `last_verified_at` recente (≤ 14 giorni) e date coerenti.
- Nessuno scraping / monitoraggio automatico.

## Stati

Da verificare, Da valutare, Idoneità da verificare, In preparazione, Presentato, Approvato, Respinto, Chiuso.

## Configurazione richiesta

1. Eseguire in Supabase SQL Editor:
   - `supabase/migrations/APPLY_NOW_funding_phase_d.sql`
2. Aprire `/dashboard/bandi`.

## File principali

- Migrazione: `supabase/migrations/APPLY_NOW_funding_phase_d.sql`
- Actions: `src/app/actions/funding.ts`
- Lib: `src/lib/funding/*`
- UI: `src/components/dashboard/funding/*`
- Pagine: `src/app/(dashboard)/dashboard/bandi/*`

## Non incluso

- Fase E KPI integrati.
- Import automatico da portali pubblici.
