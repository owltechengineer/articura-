-- RUN THIS in Supabase SQL Editor (safe if enums already exist)
-- Fixed order: profiles table before helper functions

-- ARTICURA — initial schema, RLS, storage policies
-- Apply via Supabase SQL editor or `supabase db push`

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  create type public.user_role as enum ('admin', 'collaborator');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.organization_status as enum (
  'prospect',
  'active_client',
  'former_client'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.opportunity_stage as enum (
  'prospect_identified',
  'to_contact',
  'first_contact',
  'interest_shown',
  'needs_analysis',
  'quote_sent',
  'negotiation',
  'won',
  'lost'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.project_status as enum (
  'to_plan',
  'analysis',
  'design',
  'development',
  'testing',
  'client_review',
  'delivered',
  'maintenance',
  'archived'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.quote_status as enum (
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.task_status as enum (
  'todo',
  'in_progress',
  'blocked',
  'done',
  'cancelled'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.financial_kind as enum (
  'revenue_projected',
  'revenue_invoiced',
  'revenue_collected',
  'cost',
  'recurring_expense'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.document_category as enum (
  'contract',
  'quote',
  'brief',
  'spec',
  'client_material',
  'project',
  'other'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Profiles must exist before role helper functions
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'collaborator',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);


create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role = 'admin'
  );
$$;

-- Auto-create profile on auth signup (invite-only in practice)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'collaborator')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text,
  vat_number text,
  fiscal_code text,
  email text,
  phone text,
  website text,
  sector text,
  address_line text,
  city text,
  province text,
  postal_code text,
  country text not null default 'IT',
  status public.organization_status not null default 'prospect',
  notes text,
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index organizations_vat_unique
  on public.organizations (vat_number)
  where vat_number is not null and deleted_at is null;

create index organizations_status_idx on public.organizations (status)
  where deleted_at is null;
create index organizations_owner_idx on public.organizations (owner_id);
create index organizations_legal_name_idx on public.organizations (legal_name);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  role_title text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index contacts_organization_idx on public.contacts (organization_id);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  stage public.opportunity_stage not null default 'prospect_identified',
  estimated_value numeric(14, 2),
  probability integer check (probability is null or (probability >= 0 and probability <= 100)),
  expected_close_date date,
  lost_reason text,
  next_action text,
  next_action_at timestamptz,
  owner_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index opportunities_stage_idx on public.opportunities (stage)
  where deleted_at is null;
create index opportunities_org_idx on public.opportunities (organization_id);

create table public.opportunity_activities (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  type text not null,
  summary text not null,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index opportunity_activities_opp_idx
  on public.opportunity_activities (opportunity_id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  name text not null,
  description text,
  status public.project_status not null default 'to_plan',
  owner_id uuid references public.profiles (id) on delete set null,
  budget numeric(14, 2),
  start_date date,
  due_date date,
  github_url text,
  vercel_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index projects_status_idx on public.projects (status) where deleted_at is null;
create index projects_org_idx on public.projects (organization_id);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date timestamptz,
  estimated_minutes integer,
  actual_minutes integer,
  assignee_id uuid references public.profiles (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index tasks_assignee_idx on public.tasks (assignee_id) where deleted_at is null;
create index tasks_due_date_idx on public.tasks (due_date) where deleted_at is null;
create index tasks_project_idx on public.tasks (project_id);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  minutes integer not null check (minutes > 0),
  work_date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index time_entries_project_idx on public.time_entries (project_id);
create index time_entries_user_idx on public.time_entries (user_id);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  status public.quote_status not null default 'draft',
  issue_date date not null default current_date,
  valid_until date,
  currency text not null default 'EUR',
  tax_rate numeric(5, 2),
  discount_amount numeric(14, 2) not null default 0,
  subtotal numeric(14, 2) not null default 0,
  tax_amount numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  commercial_terms text,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index quotes_status_idx on public.quotes (status) where deleted_at is null;
create index quotes_org_idx on public.quotes (organization_id);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(14, 2) not null default 0,
  discount_percent numeric(5, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  kind public.financial_kind not null,
  amount numeric(14, 2) not null,
  currency text not null default 'EUR',
  occurred_on date not null,
  description text,
  organization_id uuid references public.organizations (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  quote_id uuid references public.quotes (id) on delete set null,
  is_recurring boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index financial_transactions_kind_idx
  on public.financial_transactions (kind)
  where deleted_at is null;
create index financial_transactions_date_idx
  on public.financial_transactions (occurred_on);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.document_category not null default 'other',
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  organization_id uuid references public.organizations (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  quote_id uuid references public.quotes (id) on delete set null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references public.profiles (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------------

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger project_milestones_set_updated_at
  before update on public.project_milestones
  for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger time_entries_set_updated_at
  before update on public.time_entries
  for each row execute function public.set_updated_at();

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

create trigger financial_transactions_set_updated_at
  before update on public.financial_transactions
  for each row execute function public.set_updated_at();

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.contacts enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_activities enable row level security;
alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.time_entries enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;

-- Profiles
create policy "Staff can read profiles"
  on public.profiles for select
  using (public.is_staff());

create policy "Users can update own profile fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Generic staff CRUD for operational tables
create policy "Staff select organizations"
  on public.organizations for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert organizations"
  on public.organizations for insert with check (public.is_staff());
create policy "Staff update organizations"
  on public.organizations for update using (public.is_staff());

create policy "Staff select contacts"
  on public.contacts for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert contacts"
  on public.contacts for insert with check (public.is_staff());
create policy "Staff update contacts"
  on public.contacts for update using (public.is_staff());

create policy "Staff select opportunities"
  on public.opportunities for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert opportunities"
  on public.opportunities for insert with check (public.is_staff());
create policy "Staff update opportunities"
  on public.opportunities for update using (public.is_staff());

create policy "Staff select opportunity_activities"
  on public.opportunity_activities for select using (public.is_staff());
create policy "Staff insert opportunity_activities"
  on public.opportunity_activities for insert with check (public.is_staff());

create policy "Staff select projects"
  on public.projects for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert projects"
  on public.projects for insert with check (public.is_staff());
create policy "Staff update projects"
  on public.projects for update using (public.is_staff());

create policy "Staff select milestones"
  on public.project_milestones for select using (public.is_staff());
create policy "Staff insert milestones"
  on public.project_milestones for insert with check (public.is_staff());
create policy "Staff update milestones"
  on public.project_milestones for update using (public.is_staff());

create policy "Staff select tasks"
  on public.tasks for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert tasks"
  on public.tasks for insert with check (public.is_staff());
create policy "Staff update tasks"
  on public.tasks for update using (public.is_staff());

create policy "Staff select time_entries"
  on public.time_entries for select using (public.is_staff());
create policy "Staff insert time_entries"
  on public.time_entries for insert with check (public.is_staff());
create policy "Staff update time_entries"
  on public.time_entries for update using (public.is_staff());

create policy "Staff select quotes"
  on public.quotes for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert quotes"
  on public.quotes for insert with check (public.is_staff());
create policy "Staff update quotes"
  on public.quotes for update using (public.is_staff());

create policy "Staff select quote_items"
  on public.quote_items for select using (public.is_staff());
create policy "Staff insert quote_items"
  on public.quote_items for insert with check (public.is_staff());
create policy "Staff update quote_items"
  on public.quote_items for update using (public.is_staff());
create policy "Staff delete quote_items"
  on public.quote_items for delete using (public.is_staff());

-- Finance: collaborators read; admins write
create policy "Staff select financial_transactions"
  on public.financial_transactions for select
  using (public.is_staff() and deleted_at is null);

create policy "Admins insert financial_transactions"
  on public.financial_transactions for insert
  with check (public.is_admin());

create policy "Admins update financial_transactions"
  on public.financial_transactions for update
  using (public.is_admin());

create policy "Staff select documents"
  on public.documents for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert documents"
  on public.documents for insert with check (public.is_staff());
create policy "Staff update documents"
  on public.documents for update using (public.is_staff());

create policy "Users select own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications"
  on public.notifications for update using (auth.uid() = user_id);
create policy "Staff insert notifications"
  on public.notifications for insert with check (public.is_staff());

create policy "Admins select audit_logs"
  on public.audit_logs for select using (public.is_admin());
create policy "Staff insert audit_logs"
  on public.audit_logs for insert with check (public.is_staff());

create policy "Staff select app_settings"
  on public.app_settings for select using (public.is_staff());
create policy "Admins upsert app_settings"
  on public.app_settings for insert with check (public.is_admin());
create policy "Admins update app_settings"
  on public.app_settings for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: private documents bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Staff can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and public.is_staff());

create policy "Staff can read documents"
  on storage.objects for select
  using (bucket_id = 'documents' and public.is_staff());

create policy "Staff can update documents"
  on storage.objects for update
  using (bucket_id = 'documents' and public.is_staff());

create policy "Staff can delete documents"
  on storage.objects for delete
  using (bucket_id = 'documents' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed settings (no fake business data)
-- ---------------------------------------------------------------------------

insert into public.app_settings (key, value)
values
  ('fiscal.default_tax_rate', 'null'::jsonb),
  ('quotes.show_prices_on_public_site', 'false'::jsonb),
  ('brand.name', '"ARTICURA"'::jsonb)
on conflict (key) do nothing;
