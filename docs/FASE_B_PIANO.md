# FASE B — Piano operativo e attività

## Cosa è stato implementato

- Tabelle `strategic_objectives` e `strategic_milestones` (obiettivi annuali/trimestrali + milestone).
- Estensione di `tasks` (già esistente): `parent_task_id`, `objective_id`, `milestone_id`, `growth_phase`, `start_date`, `progress_percent`.
- Seed obiettivi configurabili (target, non risultati):
  - 300 prospect qualificati
  - 12–20 clienti paganti
  - 3 prodotti standardizzati
  - MRR 300–600 €
- Quattro fasi di crescita nel piano.
- UI `/dashboard/strategia` e `/dashboard/attivita` (sostituisce placeholder).
- Collegamenti attività ↔ obiettivo / milestone / progetto / organizzazione.

## Configurazione richiesta

1. Eseguire in Supabase SQL Editor:
   - `supabase/migrations/APPLY_NOW_plan_phase_b.sql`
2. Ricaricare `/dashboard/strategia` e `/dashboard/attivita`.

## File principali

- Migrazione: `supabase/migrations/APPLY_NOW_plan_phase_b.sql`
- Actions: `src/app/actions/plan.ts`
- Lib: `src/lib/plan/*`
- UI: `src/components/dashboard/plan/*`
- Pagine: `src/app/(dashboard)/dashboard/strategia/page.tsx`, `.../attivita/page.tsx`
- Nav: voce **Strategia** in `src/lib/constants.ts`

## Non incluso

- Fase C Social, D Bandi, E KPI integrati.
