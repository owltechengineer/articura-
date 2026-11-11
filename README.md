# ARTICURA

Piattaforma digitale ufficiale: sito pubblico + business dashboard privata.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase · Vercel

## Avvio rapido

```bash
cp .env.example .env.local
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Configurazione Supabase (obbligatoria per la dashboard)

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Copia URL e anon key in `.env.local`
3. Aggiungi la **service role key** solo in `.env.local` / Vercel (mai nel client)
4. Esegui la migrazione `supabase/migrations/20261104000001_initial_schema.sql` nel SQL Editor
5. Crea il primo utente da **Authentication → Users → Invite**
6. In `profiles`, imposta `role = 'admin'` per il tuo account

Disabilita la registrazione pubblica in Supabase Auth (solo inviti).

## Script

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Sviluppo locale |
| `npm run build` | Build produzione |
| `npm run start` | Avvia build |
| `npm run lint` | ESLint |

## Documentazione

- [Architettura](docs/ARCHITECTURE.md)
- [Schema e autorizzazioni](docs/SECURITY.md)

## Fasi

1. **Fondamenta** — setup, design system, auth, schema ← in corso
2. Sito vetrina completo
3. Dashboard MVP (CRM, clienti, progetti, preventivi, task)
4. Finanze, documenti, calendario, analytics
5. Test, performance, automazioni, go-live Vercel
