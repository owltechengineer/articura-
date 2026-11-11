# Sicurezza e autorizzazioni

## Autenticazione

- Provider: Supabase Auth
- Nessuna registrazione pubblica per la dashboard
- Account creati tramite invito
- Password reset via email Supabase
- Sessione gestita con cookie (`@supabase/ssr`)
- Refresh sessione in `src/proxy.ts`

## Ruoli

| Ruolo | Capacità |
|-------|----------|
| `admin` | Accesso completo, utenti, settings, write finance, audit |
| `collaborator` | Operatività CRM/progetti/preventivi/task; finance solo lettura |
| `client` | Predisposto per il futuro, non attivo in release 1 |

Matrice applicativa in `src/lib/auth/permissions.ts`.

## Controlli

1. **Proxy** — redirect `/dashboard/*` se non autenticato
2. **Server layout / actions** — `requireUser()` + permission check
3. **RLS PostgreSQL** — staff attivo; finance write solo admin; notifiche per utente; audit solo admin

## Segreti

| Variabile | Dove |
|-----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server (`src/lib/supabase/admin.ts`) |
| `RESEND_API_KEY` | Solo server |

## Storage documenti

Bucket `documents` privato. Download solo con URL firmato / sessione autorizzata. Nessun URL pubblico permanente.

## Audit

Tabella `audit_logs` per operazioni critiche (inviti, cambi ruolo, export finanziari, eliminazioni).
