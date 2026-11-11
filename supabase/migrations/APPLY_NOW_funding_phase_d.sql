-- FASE D — Bandi e finanziamenti
-- Run after APPLY_NOW_social_phase_c.sql
-- NO scraping / NO automatic monitoring. Official URL + last_verified_at required for "open" claims.

DO $$ BEGIN
  create type public.funding_status as enum (
    'to_verify',
    'to_evaluate',
    'eligibility_check',
    'in_preparation',
    'submitted',
    'approved',
    'rejected',
    'closed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

create table if not exists public.funding_opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  promoter text,
  region text,
  territory text,
  official_url text,
  aid_type text,
  max_contribution_eur numeric(14, 2),
  funding_percent numeric(5, 2),
  min_investment_eur numeric(14, 2),
  eligibility_requirements text,
  opens_on date,
  closes_on date,
  last_verified_at date,
  status public.funding_status not null default 'to_verify',
  reminder_at timestamptz,
  notes text,
  owner_id uuid references public.profiles (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists funding_opportunities_status_idx
  on public.funding_opportunities (status)
  where deleted_at is null;
create index if not exists funding_opportunities_closes_idx
  on public.funding_opportunities (closes_on)
  where deleted_at is null and closes_on is not null;
create index if not exists funding_opportunities_reminder_idx
  on public.funding_opportunities (reminder_at)
  where deleted_at is null and reminder_at is not null;

create table if not exists public.funding_documents (
  id uuid primary key default gen_random_uuid(),
  funding_id uuid not null references public.funding_opportunities (id) on delete cascade,
  title text not null,
  description text,
  is_required boolean not null default true,
  is_done boolean not null default false,
  due_on date,
  storage_path text,
  sort_order integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists funding_documents_funding_idx
  on public.funding_documents (funding_id, sort_order);

-- Link existing tasks to funding opportunities (no duplicate activity table)
alter table public.tasks
  add column if not exists funding_id uuid references public.funding_opportunities (id) on delete set null;

create index if not exists tasks_funding_idx on public.tasks (funding_id);

drop trigger if exists funding_opportunities_set_updated_at on public.funding_opportunities;
create trigger funding_opportunities_set_updated_at
  before update on public.funding_opportunities
  for each row execute function public.set_updated_at();

drop trigger if exists funding_documents_set_updated_at on public.funding_documents;
create trigger funding_documents_set_updated_at
  before update on public.funding_documents
  for each row execute function public.set_updated_at();

alter table public.funding_opportunities enable row level security;
alter table public.funding_documents enable row level security;

drop policy if exists "Staff select funding_opportunities" on public.funding_opportunities;
drop policy if exists "Staff insert funding_opportunities" on public.funding_opportunities;
drop policy if exists "Staff update funding_opportunities" on public.funding_opportunities;
create policy "Staff select funding_opportunities"
  on public.funding_opportunities for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert funding_opportunities"
  on public.funding_opportunities for insert with check (public.is_staff());
create policy "Staff update funding_opportunities"
  on public.funding_opportunities for update using (public.is_staff());

drop policy if exists "Staff select funding_documents" on public.funding_documents;
drop policy if exists "Staff insert funding_documents" on public.funding_documents;
drop policy if exists "Staff update funding_documents" on public.funding_documents;
drop policy if exists "Staff delete funding_documents" on public.funding_documents;
create policy "Staff select funding_documents"
  on public.funding_documents for select using (public.is_staff());
create policy "Staff insert funding_documents"
  on public.funding_documents for insert with check (public.is_staff());
create policy "Staff update funding_documents"
  on public.funding_documents for update using (public.is_staff());
create policy "Staff delete funding_documents"
  on public.funding_documents for delete using (public.is_staff());

grant select, insert, update, delete on public.funding_opportunities
  to anon, authenticated, service_role;
grant select, insert, update, delete on public.funding_documents
  to anon, authenticated, service_role;

notify pgrst, 'reload schema';
