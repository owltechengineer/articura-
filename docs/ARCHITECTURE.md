# ARTICURA — Architettura

## Panoramica

Monolith Next.js (App Router) con due superfici:

1. **Sito pubblico** — route group `(public)`
2. **Dashboard privata** — route group `(dashboard)` protetta da `proxy.ts` + controlli server

Stack: Next.js 16 · React 19 · TypeScript strict · Tailwind 4 · Supabase · Vercel

## Struttura cartelle

```text
src/
  app/
    (public)/          # sito vetrina
    (auth)/login/      # accesso (no signup pubblico)
    (dashboard)/       # area operativa
    actions/           # Server Actions
    auth/callback/     # OAuth / magic-link exchange
  components/
    ui/                # primitives (shadcn-style)
    layout/            # header, sidebar, shell
    marketing/         # pezzi sito pubblico
    auth/
    dashboard/
  lib/
    supabase/          # client, server, admin, proxy helper
    auth/              # session + permissions
    validations/
  types/database.ts    # tipi generati/manutenuti dello schema
supabase/migrations/   # SQL versionato + RLS
```

## Principi

- Un’unica anagrafica `organizations` con `status` (`prospect` | `active_client` | `former_client`)
- Separazione UI / logica / data access
- Mutazioni solo via Server Actions / Route Handlers con Zod + auth
- Nessun dato demo in produzione
- Service role key solo server-side
- Documenti in bucket Storage privato

## Ambienti

| Ambiente | Uso |
|----------|-----|
| local | `.env.local` + Supabase project o CLI |
| preview | Vercel Preview + branch |
| production | Vercel Production + dominio |

## Estensioni future

- Portale cliente (ruolo `client` predisposto, non attivo)
- Moduli SaaS in `src/features/*`
- AI assistiva con approval umana obbligatoria
