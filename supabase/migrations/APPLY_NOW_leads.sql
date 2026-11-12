-- Lead / contact requests for public forms
-- Run after prior APPLY_NOW migrations.

create table if not exists public.lead_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  kind text not null default 'contact'
    check (kind in ('contact', 'quote', 'consultation')),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  contact_role text,
  company_name text,
  vat_number text,
  website text,
  city text,
  province text,
  sector text,
  company_size text,
  interested_service text,
  budget_range text,
  timeline text,
  how_heard text,
  current_tools text,
  message text,
  privacy_accepted boolean not null default false,
  marketing_opt_in boolean not null default false,
  status text not null default 'new'
    check (status in ('new', 'in_review', 'contacted', 'converted', 'archived')),
  organization_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint lead_requests_privacy_required check (privacy_accepted = true)
);

create index if not exists lead_requests_status_idx
  on public.lead_requests (status)
  where deleted_at is null;
create index if not exists lead_requests_created_idx
  on public.lead_requests (created_at desc);

-- Optional richer contact payload on catalog quote requests
alter table public.quote_requests
  add column if not exists contact_details jsonb not null default '{}'::jsonb;

drop trigger if exists lead_requests_set_updated_at on public.lead_requests;
create trigger lead_requests_set_updated_at
  before update on public.lead_requests
  for each row execute function public.set_updated_at();

alter table public.lead_requests enable row level security;

drop policy if exists "Anyone insert lead_requests" on public.lead_requests;
drop policy if exists "Staff select lead_requests" on public.lead_requests;
drop policy if exists "Staff update lead_requests" on public.lead_requests;

create policy "Anyone insert lead_requests"
  on public.lead_requests for insert with check (
    privacy_accepted = true and marketing_opt_in is not null
  );
create policy "Staff select lead_requests"
  on public.lead_requests for select using (public.is_staff() and deleted_at is null);
create policy "Staff update lead_requests"
  on public.lead_requests for update using (public.is_staff());

grant select, insert, update, delete on public.lead_requests
  to anon, authenticated, service_role;

notify pgrst, 'reload schema';
