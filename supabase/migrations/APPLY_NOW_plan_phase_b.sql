-- FASE B — Piano operativo / strategia di avvio e crescita
-- Run after APPLY_NOW_crm_phase_a.sql

DO $$ BEGIN
  create type public.growth_phase as enum (
    'preparation_sales',
    'commercial_validation',
    'saas_standardization',
    'controlled_growth'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.objective_horizon as enum (
    'annual',
    'quarterly'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.objective_metric as enum (
    'qualified_prospects',
    'paying_clients',
    'standardized_products',
    'mrr_eur',
    'custom'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

create table if not exists public.strategic_objectives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  horizon public.objective_horizon not null default 'annual',
  year integer not null,
  quarter integer check (quarter is null or (quarter >= 1 and quarter <= 4)),
  growth_phase public.growth_phase not null default 'preparation_sales',
  metric public.objective_metric not null default 'custom',
  target_value numeric(14, 2),
  target_min numeric(14, 2),
  target_max numeric(14, 2),
  unit text,
  is_target_only boolean not null default true,
  status public.task_status not null default 'todo',
  progress_percent integer not null default 0
    check (progress_percent >= 0 and progress_percent <= 100),
  owner_id uuid references public.profiles (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  sort_order integer not null default 0,
  starts_on date,
  due_on date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists strategic_objectives_year_idx
  on public.strategic_objectives (year, horizon)
  where deleted_at is null;
create index if not exists strategic_objectives_phase_idx
  on public.strategic_objectives (growth_phase)
  where deleted_at is null;

create table if not exists public.strategic_milestones (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.strategic_objectives (id) on delete cascade,
  title text not null,
  description text,
  growth_phase public.growth_phase,
  status public.task_status not null default 'todo',
  progress_percent integer not null default 0
    check (progress_percent >= 0 and progress_percent <= 100),
  owner_id uuid references public.profiles (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  starts_on date,
  due_on date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists strategic_milestones_objective_idx
  on public.strategic_milestones (objective_id)
  where deleted_at is null;

-- Extend existing tasks for piano operativo (no duplicate activity table)
alter table public.tasks
  add column if not exists parent_task_id uuid references public.tasks (id) on delete set null,
  add column if not exists objective_id uuid references public.strategic_objectives (id) on delete set null,
  add column if not exists milestone_id uuid references public.strategic_milestones (id) on delete set null,
  add column if not exists growth_phase public.growth_phase,
  add column if not exists start_date date,
  add column if not exists progress_percent integer not null default 0;

do $$ begin
  alter table public.tasks
    add constraint tasks_progress_percent_check
    check (progress_percent >= 0 and progress_percent <= 100);
exception
  when duplicate_object then null;
end $$;

create index if not exists tasks_parent_idx on public.tasks (parent_task_id);
create index if not exists tasks_objective_idx on public.tasks (objective_id);
create index if not exists tasks_milestone_idx on public.tasks (milestone_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists strategic_objectives_set_updated_at on public.strategic_objectives;
create trigger strategic_objectives_set_updated_at
  before update on public.strategic_objectives
  for each row execute function public.set_updated_at();

drop trigger if exists strategic_milestones_set_updated_at on public.strategic_milestones;
create trigger strategic_milestones_set_updated_at
  before update on public.strategic_milestones
  for each row execute function public.set_updated_at();

alter table public.strategic_objectives enable row level security;
alter table public.strategic_milestones enable row level security;

drop policy if exists "Staff select strategic_objectives" on public.strategic_objectives;
drop policy if exists "Staff insert strategic_objectives" on public.strategic_objectives;
drop policy if exists "Staff update strategic_objectives" on public.strategic_objectives;
create policy "Staff select strategic_objectives"
  on public.strategic_objectives for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert strategic_objectives"
  on public.strategic_objectives for insert with check (public.is_staff());
create policy "Staff update strategic_objectives"
  on public.strategic_objectives for update using (public.is_staff());

drop policy if exists "Staff select strategic_milestones" on public.strategic_milestones;
drop policy if exists "Staff insert strategic_milestones" on public.strategic_milestones;
drop policy if exists "Staff update strategic_milestones" on public.strategic_milestones;
create policy "Staff select strategic_milestones"
  on public.strategic_milestones for select using (public.is_staff() and deleted_at is null);
create policy "Staff insert strategic_milestones"
  on public.strategic_milestones for insert with check (public.is_staff());
create policy "Staff update strategic_milestones"
  on public.strategic_milestones for update using (public.is_staff());

grant select, insert, update, delete on public.strategic_objectives
  to anon, authenticated, service_role;
grant select, insert, update, delete on public.strategic_milestones
  to anon, authenticated, service_role;

-- Seed default YEAR targets only if none exist (editable objectives, not results)
insert into public.strategic_objectives (
  id, title, description, horizon, year, growth_phase, metric,
  target_value, target_min, target_max, unit, is_target_only, sort_order, notes
)
select * from (
  values
    (
      'a1000000-0000-4000-8000-000000000001'::uuid,
      '300 prospect qualificati',
      'Obiettivo annuale configurabile: aziende prospect nello stato Qualificato o superiore.',
      'annual'::public.objective_horizon,
      extract(year from current_date)::integer,
      'preparation_sales'::public.growth_phase,
      'qualified_prospects'::public.objective_metric,
      300::numeric, null::numeric, null::numeric, 'aziende', true, 10,
      'Valore obiettivo, non risultato raggiunto.'
    ),
    (
      'a1000000-0000-4000-8000-000000000002'::uuid,
      '12–20 clienti paganti',
      'Primo anno: acquisire clienti paganti senza duplicare anagrafiche prospect.',
      'annual'::public.objective_horizon,
      extract(year from current_date)::integer,
      'commercial_validation'::public.growth_phase,
      'paying_clients'::public.objective_metric,
      null::numeric, 12::numeric, 20::numeric, 'clienti', true, 20,
      'Range obiettivo modificabile.'
    ),
    (
      'a1000000-0000-4000-8000-000000000003'::uuid,
      'Tre prodotti standardizzati',
      'Offerta SaaS/servizi ripetibili da listino.',
      'annual'::public.objective_horizon,
      extract(year from current_date)::integer,
      'saas_standardization'::public.growth_phase,
      'standardized_products'::public.objective_metric,
      3::numeric, null::numeric, null::numeric, 'prodotti', true, 30,
      'Obiettivo di standardizzazione.'
    ),
    (
      'a1000000-0000-4000-8000-000000000004'::uuid,
      'MRR 300–600 € a fine anno',
      'Ricavi ricorrenti mensili stimati a fine anno.',
      'annual'::public.objective_horizon,
      extract(year from current_date)::integer,
      'controlled_growth'::public.growth_phase,
      'mrr_eur'::public.objective_metric,
      null::numeric, 300::numeric, 600::numeric, 'EUR/mese', true, 40,
      'Obiettivo economico, distinto dai ricavi reali.'
    )
) as seed(
  id, title, description, horizon, year, growth_phase, metric,
  target_value, target_min, target_max, unit, is_target_only, sort_order, notes
)
where not exists (
  select 1 from public.strategic_objectives where deleted_at is null
);

insert into public.strategic_milestones (
  id, objective_id, title, description, growth_phase, sort_order, due_on
)
select * from (
  values
    (
      'b1000000-0000-4000-8000-000000000001'::uuid,
      'a1000000-0000-4000-8000-000000000001'::uuid,
      'Setup CRM e pipeline',
      'Anagrafiche prospect, stati commerciali, import Excel.',
      'preparation_sales'::public.growth_phase,
      10,
      (date_trunc('year', current_date) + interval '3 months' - interval '1 day')::date
    ),
    (
      'b1000000-0000-4000-8000-000000000002'::uuid,
      'a1000000-0000-4000-8000-000000000002'::uuid,
      'Prime vendite e validazione offerta',
      'Chiudere i primi clienti paganti e raccogliere feedback.',
      'commercial_validation'::public.growth_phase,
      20,
      (date_trunc('year', current_date) + interval '6 months' - interval '1 day')::date
    ),
    (
      'b1000000-0000-4000-8000-000000000003'::uuid,
      'a1000000-0000-4000-8000-000000000003'::uuid,
      'Pacchetti standard in catalogo',
      'Tre prodotti/servizi ripetibili pubblicati nel listino.',
      'saas_standardization'::public.growth_phase,
      30,
      (date_trunc('year', current_date) + interval '9 months' - interval '1 day')::date
    ),
    (
      'b1000000-0000-4000-8000-000000000004'::uuid,
      'a1000000-0000-4000-8000-000000000004'::uuid,
      'MRR nel target di fine anno',
      'Abbonamenti attivi che contribuiscono al range 300–600 €.',
      'controlled_growth'::public.growth_phase,
      40,
      (date_trunc('year', current_date) + interval '1 year' - interval '1 day')::date
    )
) as seed(id, objective_id, title, description, growth_phase, sort_order, due_on)
where exists (
  select 1 from public.strategic_objectives o where o.id = seed.objective_id
)
and not exists (
  select 1 from public.strategic_milestones m where m.id = seed.id
);

notify pgrst, 'reload schema';
