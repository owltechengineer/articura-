# FASE C — Calendario social / piano editoriale

## Cosa è stato implementato

- Tabelle `marketing_campaigns` e `social_contents`.
- UI `/dashboard/marketing`: calendario mensile e settimanale, elenco, idee/template, campagne.
- `/dashboard/calendario` riusa la stessa vista (compact) senza duplicare logica.
- Campi: titolo, descrizione, testo, piattaforma, tipologia, stato, data prevista, allegati, campagna.
- Upload allegati su bucket `documents` (`marketing/social/...`).
- **Nessuna pubblicazione automatica** e nessuna integrazione API social.

## Stati

Idea → Da produrre → In revisione → Programmato → Pubblicato (manuale).

## Piattaforme / tipologie

LinkedIn, Instagram, Facebook, TikTok · Reel, carosello, post, case study.

## Configurazione richiesta

1. Eseguire in Supabase SQL Editor:
   - `supabase/migrations/APPLY_NOW_social_phase_c.sql`
2. Verificare che il bucket Storage `documents` esista (già creato dallo schema iniziale).
3. Aprire `/dashboard/marketing`.

## File principali

- Migrazione: `supabase/migrations/APPLY_NOW_social_phase_c.sql`
- Actions: `src/app/actions/social.ts`
- Lib: `src/lib/social/*`
- UI: `src/components/dashboard/social/marketing-workspace.tsx`
- Pagine: `.../marketing/page.tsx`, `.../calendario/page.tsx`

## Non incluso

- Fase D Bandi, Fase E KPI.
- Auto-posting LinkedIn/Meta/TikTok.
