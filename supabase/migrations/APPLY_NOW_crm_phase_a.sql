-- FASE A — CRM Prospect fields on existing organizations
-- Run in Supabase SQL Editor after initial schema + grants.

DO $$ BEGIN
  create type public.qualification_status as enum (
    'new',
    'to_verify',
    'qualified',
    'contacted',
    'interested',
    'demo_scheduled',
    'quote_sent',
    'won_client',
    'not_interested'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.commercial_priority as enum (
    'low',
    'medium',
    'high',
    'urgent'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

alter table public.organizations
  add column if not exists source text,
  add column if not exists verified_at date,
  add column if not exists company_size_estimate text,
  add column if not exists qualification_status public.qualification_status
    not null default 'new',
  add column if not exists interested_service text,
  add column if not exists commercial_priority public.commercial_priority
    not null default 'medium',
  add column if not exists follow_up_at timestamptz,
  add column if not exists website_domain text,
  add column if not exists duplicate_group_id uuid,
  add column if not exists duplicate_reviewed_at timestamptz;

create index if not exists organizations_qualification_idx
  on public.organizations (qualification_status)
  where deleted_at is null;

create index if not exists organizations_follow_up_idx
  on public.organizations (follow_up_at)
  where deleted_at is null and follow_up_at is not null;

create index if not exists organizations_domain_idx
  on public.organizations (website_domain)
  where deleted_at is null and website_domain is not null;

create index if not exists organizations_email_idx
  on public.organizations (lower(email))
  where deleted_at is null and email is not null;

-- Interaction log already exists as opportunity_activities.
-- Lightweight org notes timeline for CRM without requiring an opportunity.
create table if not exists public.organization_interactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type text not null default 'note',
  summary text not null,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists organization_interactions_org_idx
  on public.organization_interactions (organization_id, occurred_at desc);

alter table public.organization_interactions enable row level security;

drop policy if exists "Staff select organization_interactions" on public.organization_interactions;
drop policy if exists "Staff insert organization_interactions" on public.organization_interactions;

create policy "Staff select organization_interactions"
  on public.organization_interactions for select using (public.is_staff());
create policy "Staff insert organization_interactions"
  on public.organization_interactions for insert with check (public.is_staff());

grant select, insert, update, delete on public.organization_interactions
  to anon, authenticated, service_role;

notify pgrst, 'reload schema';
