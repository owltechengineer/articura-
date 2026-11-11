# FASE E — KPI integrati e reportistica

## Cosa è stato implementato

- Aggregazione KPI da dati esistenti (nessuna tabella nuova, nessun dato demo).
- `/dashboard/analytics`: report completo commerciale / economia / marketing / obiettivi.
- `/dashboard`: highlight + vista compatta degli stessi KPI.
- Etichette obbligatorie: **Reale**, **Stimato**, **Obiettivo**, **Non disponibile**.

## Fonti

| Area | Fonte |
|------|--------|
| Prospect / pipeline | `organizations.qualification_status` |
| Preventivi | `quotes` + `quote_requests` |
| MRR/ARR | movimenti ricorrenti **reali**, altrimenti ricorrente da quote convertite (**stimato**), altrimenti n/d |
| Incassi / costi / margine | `financial_transactions` |
| Social | `social_contents` |
| Lead social | `organizations.source` (se valorizzato) |
| Obiettivi | `strategic_objectives` (solo target) |

## Performance contenuti

Mostrata come **n/d** finché non esistono metriche engagement reali. Non viene inventata.

## Configurazione

Nessuna nuova migrazione SQL. Richiede migrazioni A–D già applicate.

## File principali

- Lib: `src/lib/kpi/*`
- UI: `src/components/dashboard/kpi/kpi-dashboard.tsx`
- Pagine: `dashboard/page.tsx`, `dashboard/analytics/page.tsx`
