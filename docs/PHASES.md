# Piano di implementazione

## Fase 1 — Fondamenta ✅ (base attiva)

- [x] Next.js App Router + TypeScript strict
- [x] Design tokens + UI primitives
- [x] Layout pubblico e dashboard
- [x] Route pubbliche e dashboard (scaffold)
- [x] Supabase clients + `proxy.ts`
- [x] Login / logout / callback
- [x] Schema SQL + RLS + storage bucket
- [x] Matrice permessi admin/collaborator
- [x] `.env.example`, robots, sitemap

## Fase 2 — Sito vetrina

- Contenuti completi servizi / settori / chi siamo
- Form contatti e richiesta preventivo → lead CRM
- Portfolio con empty state aggiornabile
- SEO avanzata e structured data
- Cookie consent

## Fase 3 — Dashboard MVP

- [x] Configurazione Preventivi (listino da dashboard)
- [x] Configuratore pubblico `/servizi` da database
- [x] Snapshot prezzi storici sulle richieste
- CRM kanban + tabella + CSV import
- Clienti (scheda completa)
- Progetti (kanban / lista / timeline)
- Preventivi PDF/email
- Task (oggi / settimana / kanban)

## Fase 4 — Controllo gestionale

- Finanze e margini
- Documenti Storage
- Calendario
- Analytics + notifiche

## Fase 5 — Ottimizzazione

- Test autorizzazioni e calcoli
- Hardening sicurezza
- Performance Lighthouse ≥ 90
- Automazioni Resend
- Deploy Vercel produzione
