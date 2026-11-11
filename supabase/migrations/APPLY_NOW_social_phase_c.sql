-- FASE C — Piano editoriale social / marketing
-- Run after APPLY_NOW_plan_phase_b.sql
-- NO automatic publishing. Manual schedule + status only.

DO $$ BEGIN
  create type public.social_platform as enum (
    'linkedin',
    'instagram',
    'facebook',
    'tiktok'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.social_content_status as enum (
    'idea',
    'to_produce',
    'in_review',
    'scheduled',
    'published'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.social_content_type as enum (
    'reel',
    'carousel',
    'post',
    'case_study'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  starts_on date,
  ends_on date,
  status text not null default 'active'
    check (status in ('draft', 'active', 'completed', 'archived')),
  owner_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists marketing_campaigns_status_idx
  on public.marketing_campaigns (status)
  where deleted_at is null;

create table if not exists public.social_contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  body text,
  platform public.social_platform not null,
  content_type public.social_content_type not null default 'post',
  status public.social_content_status not null default 'idea',
  scheduled_for timestamptz,
  published_at timestamptz,
  campaign_id uuid references public.marketing_campaigns (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  objective_id uuid references public.strategic_objectives (id) on delete set null,
  is_template boolean not null default false,
  is_idea_archive boolean not null default false,
  attachments jsonb not null default '[]'::jsonb,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint social_contents_published_requires_date check (
    status <> 'published' or published_at is not null
  )
);

create index if not exists social_contents_schedule_idx
  on public.social_contents (scheduled_for)
  where deleted_at is null and scheduled_for is not null;
create index if not exists social_contents_status_idx
  on public.social_contents (status)
  where deleted_at is null;
create index if not exists social_contents_platform_idx
  on public.social_contents (platform)
  where deleted_at is null;
create index if not exists social_contents_campaign_idx
  on public.social_contents (campaign_id)
  where deleted_at is null;
create index if not exists social_contents_templates_idx
  on public.social_contents (is_template)
  where deleted_at is null and is_template = true;
create index if not exists social_contents_ideas_idx
  on public.social_contents (is_idea_archive)
  where deleted_at is null and is_idea_archive = true;

drop trigger if exists marketing_campaigns_set_updated_at on public.marketing_campaigns;
create trigger marketing_campaigns_set_updated_at
  before update on public.marketing_campaigns
  for each row execute function public.set_updated_at();

drop trigger if exists social_contents_set_updated_at on public.social_contents;
create trigger social_contents_set_updated_at
  before update on public.social_contents
  for each row execute function public.set_updated_at();

alter table public.marketing_campaigns enable row level security;
alter table public.social_contents enable row level security;

drop policy if exists "Staff select marketing_campaigns" on public.marketing_campaigns;
drop policy if exists "Staff insert marketing_campaigns" on public.marketing_campaigns;
drop policy if exists "Staff update marketing_campaigns" on public.marketing_campaigns;
create policy "Staff select marketing_campaigns"
  on public.marketing_campaigns for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert marketing_campaigns"
  on public.marketing_campaigns for insert with check (public.is_staff());
create policy "Staff update marketing_campaigns"
  on public.marketing_campaigns for update using (public.is_staff());

drop policy if exists "Staff select social_contents" on public.social_contents;
drop policy if exists "Staff insert social_contents" on public.social_contents;
drop policy if exists "Staff update social_contents" on public.social_contents;
create policy "Staff select social_contents"
  on public.social_contents for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert social_contents"
  on public.social_contents for insert with check (public.is_staff());
create policy "Staff update social_contents"
  on public.social_contents for update using (public.is_staff());

grant select, insert, update, delete on public.marketing_campaigns
  to anon, authenticated, service_role;
grant select, insert, update, delete on public.social_contents
  to anon, authenticated, service_role;

-- Private marketing media folder in existing documents bucket (no new external SaaS)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
