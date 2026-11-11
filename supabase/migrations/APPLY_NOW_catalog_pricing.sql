-- RUN THIS in Supabase SQL Editor after APPLY_NOW_initial_schema.sql
-- Catalog / preventivi pricing schema

-- ARTICURA — catalogo commerciale / configuratore preventivi
-- Prezzi in centesimi (integer). Soft-delete. Snapshot storici su quote_requests.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  create type public.catalog_price_kind as enum (
  'fixed',
  'from',
  'on_request',
  'per_unit'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.catalog_billing_period as enum (
  'one_time',
  'monthly',
  'yearly'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.catalog_publish_status as enum (
  'draft',
  'published'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.promotion_kind as enum (
  'percent',
  'fixed_amount',
  'package_price'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.quote_request_status as enum (
  'new',
  'in_review',
  'converted',
  'archived'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Catalog categories
-- ---------------------------------------------------------------------------

create table public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table public.catalog_services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.catalog_categories (id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text,
  features jsonb not null default '[]'::jsonb,
  price_kind public.catalog_price_kind not null default 'on_request',
  base_price_cents integer,
  recurring_price_cents integer,
  recurring_period public.catalog_billing_period not null default 'one_time',
  is_available_in_configurator boolean not null default true,
  status public.catalog_publish_status not null default 'draft',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint catalog_services_base_price_nonneg
    check (base_price_cents is null or base_price_cents >= 0),
  constraint catalog_services_recurring_nonneg
    check (recurring_price_cents is null or recurring_price_cents >= 0)
);

create index catalog_services_category_idx on public.catalog_services (category_id)
  where deleted_at is null;
create index catalog_services_public_idx on public.catalog_services (status, is_active, sort_order)
  where deleted_at is null and is_available_in_configurator = true;

create table public.catalog_addons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_kind public.catalog_price_kind not null default 'fixed',
  unit_price_cents integer,
  recurring_price_cents integer,
  recurring_period public.catalog_billing_period not null default 'one_time',
  min_qty integer not null default 1,
  max_qty integer,
  depends_on_addon_ids uuid[] not null default '{}',
  incompatible_addon_ids uuid[] not null default '{}',
  status public.catalog_publish_status not null default 'draft',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint catalog_addons_unit_price_nonneg
    check (unit_price_cents is null or unit_price_cents >= 0),
  constraint catalog_addons_qty_valid
    check (min_qty >= 1 and (max_qty is null or max_qty >= min_qty))
);

create table public.catalog_service_addons (
  service_id uuid not null references public.catalog_services (id) on delete cascade,
  addon_id uuid not null references public.catalog_addons (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (service_id, addon_id)
);

create table public.catalog_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  features jsonb not null default '[]'::jsonb,
  price_kind public.catalog_price_kind not null default 'fixed',
  package_price_cents integer,
  recurring_price_cents integer,
  recurring_period public.catalog_billing_period not null default 'one_time',
  is_available_in_configurator boolean not null default true,
  status public.catalog_publish_status not null default 'draft',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint catalog_packages_price_nonneg
    check (package_price_cents is null or package_price_cents >= 0)
);

create table public.catalog_package_items (
  package_id uuid not null references public.catalog_packages (id) on delete cascade,
  service_id uuid not null references public.catalog_services (id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (package_id, service_id)
);

create table public.catalog_promotions (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  kind public.promotion_kind not null,
  percent_off numeric(5, 2),
  amount_off_cents integer,
  package_id uuid references public.catalog_packages (id) on delete cascade,
  promo_package_price_cents integer,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  stackable boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint catalog_promotions_percent_range
    check (percent_off is null or (percent_off > 0 and percent_off <= 100)),
  constraint catalog_promotions_amount_nonneg
    check (amount_off_cents is null or amount_off_cents >= 0)
);

create unique index catalog_promotions_code_unique
  on public.catalog_promotions (lower(code))
  where code is not null and deleted_at is null;

create table public.catalog_list_versions (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique,
  label text,
  snapshot jsonb not null,
  published_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  status public.quote_request_status not null default 'new',
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  company_name text,
  notes text,
  selection jsonb not null,
  pricing_snapshot jsonb not null,
  list_version integer not null,
  subtotal_one_time_cents integer not null default 0,
  discount_cents integer not null default 0,
  tax_rate numeric(5, 2),
  tax_cents integer not null default 0,
  total_one_time_cents integer not null default 0,
  total_recurring_monthly_cents integer not null default 0,
  total_recurring_yearly_cents integer not null default 0,
  has_on_request_items boolean not null default false,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index quote_requests_status_idx on public.quote_requests (status)
  where deleted_at is null;
create index quote_requests_created_idx on public.quote_requests (created_at desc);

create table public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests (id) on delete cascade,
  item_type text not null,
  ref_id uuid,
  name text not null,
  quantity integer not null default 1,
  unit_price_cents integer,
  line_total_cents integer,
  recurring_price_cents integer,
  recurring_period public.catalog_billing_period,
  price_kind public.catalog_price_kind not null,
  meta jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index quote_request_items_request_idx
  on public.quote_request_items (quote_request_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger catalog_categories_set_updated_at
  before update on public.catalog_categories
  for each row execute function public.set_updated_at();

create trigger catalog_services_set_updated_at
  before update on public.catalog_services
  for each row execute function public.set_updated_at();

create trigger catalog_addons_set_updated_at
  before update on public.catalog_addons
  for each row execute function public.set_updated_at();

create trigger catalog_packages_set_updated_at
  before update on public.catalog_packages
  for each row execute function public.set_updated_at();

create trigger catalog_promotions_set_updated_at
  before update on public.catalog_promotions
  for each row execute function public.set_updated_at();

create trigger quote_requests_set_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.catalog_categories enable row level security;
alter table public.catalog_services enable row level security;
alter table public.catalog_addons enable row level security;
alter table public.catalog_service_addons enable row level security;
alter table public.catalog_packages enable row level security;
alter table public.catalog_package_items enable row level security;
alter table public.catalog_promotions enable row level security;
alter table public.catalog_list_versions enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_items enable row level security;

-- Public read of published catalog (anon + authenticated)
create policy "Public read published categories"
  on public.catalog_categories for select
  using (deleted_at is null and is_active = true);

create policy "Public read published services"
  on public.catalog_services for select
  using (
    deleted_at is null
    and is_active = true
    and status = 'published'
    and is_available_in_configurator = true
  );

create policy "Public read published addons"
  on public.catalog_addons for select
  using (deleted_at is null and is_active = true and status = 'published');

create policy "Public read service addons"
  on public.catalog_service_addons for select
  using (true);

create policy "Public read published packages"
  on public.catalog_packages for select
  using (
    deleted_at is null
    and is_active = true
    and status = 'published'
    and is_available_in_configurator = true
  );

create policy "Public read package items"
  on public.catalog_package_items for select
  using (true);

create policy "Public read active promotions"
  on public.catalog_promotions for select
  using (
    deleted_at is null
    and is_active = true
    and (starts_at is null or starts_at <= timezone('utc', now()))
    and (ends_at is null or ends_at >= timezone('utc', now()))
  );

-- Staff / admin management
create policy "Staff read all categories"
  on public.catalog_categories for select using (public.is_staff());
create policy "Admins write categories"
  on public.catalog_categories for insert with check (public.is_admin());
create policy "Admins update categories"
  on public.catalog_categories for update using (public.is_admin());

create policy "Staff read all services"
  on public.catalog_services for select using (public.is_staff());
create policy "Admins write services"
  on public.catalog_services for insert with check (public.is_admin());
create policy "Admins update services"
  on public.catalog_services for update using (public.is_admin());

create policy "Staff read all addons"
  on public.catalog_addons for select using (public.is_staff());
create policy "Admins write addons"
  on public.catalog_addons for insert with check (public.is_admin());
create policy "Admins update addons"
  on public.catalog_addons for update using (public.is_admin());

create policy "Staff read service addons"
  on public.catalog_service_addons for select using (public.is_staff());
create policy "Admins write service addons"
  on public.catalog_service_addons for insert with check (public.is_admin());
create policy "Admins delete service addons"
  on public.catalog_service_addons for delete using (public.is_admin());

create policy "Staff read all packages"
  on public.catalog_packages for select using (public.is_staff());
create policy "Admins write packages"
  on public.catalog_packages for insert with check (public.is_admin());
create policy "Admins update packages"
  on public.catalog_packages for update using (public.is_admin());

create policy "Staff read package items"
  on public.catalog_package_items for select using (public.is_staff());
create policy "Admins write package items"
  on public.catalog_package_items for insert with check (public.is_admin());
create policy "Admins delete package items"
  on public.catalog_package_items for delete using (public.is_admin());

create policy "Staff read promotions"
  on public.catalog_promotions for select using (public.is_staff());
create policy "Admins write promotions"
  on public.catalog_promotions for insert with check (public.is_admin());
create policy "Admins update promotions"
  on public.catalog_promotions for update using (public.is_admin());

create policy "Staff read list versions"
  on public.catalog_list_versions for select using (public.is_staff());
create policy "Admins insert list versions"
  on public.catalog_list_versions for insert with check (public.is_admin());

-- Quote requests: public insert via service role / edge; staff read/update
create policy "Staff select quote_requests"
  on public.quote_requests for select using (public.is_staff() and deleted_at is null);
create policy "Staff update quote_requests"
  on public.quote_requests for update using (public.is_staff());
create policy "Anyone insert quote_requests"
  on public.quote_requests for insert with check (true);

create policy "Staff select quote_request_items"
  on public.quote_request_items for select using (public.is_staff());
create policy "Anyone insert quote_request_items"
  on public.quote_request_items for insert with check (true);

-- ---------------------------------------------------------------------------
-- Seed categories + starter services/addons (NO hardcoded public prices)
-- ---------------------------------------------------------------------------

insert into public.catalog_categories (slug, name, description, sort_order) values
  ('siti-web', 'Siti web', 'Presenza digitale aziendale e landing', 10),
  ('e-commerce', 'E-commerce', 'Vendita online e cataloghi', 20),
  ('crm-gestionali', 'CRM e gestionali', 'Gestione clienti, preventivi e processi', 30),
  ('software-saas', 'Software SaaS', 'Piattaforme software ricorrenti', 40),
  ('automazioni-ai', 'Automazioni e AI', 'Automazioni e assistenti con controllo umano', 50),
  ('configuratori', 'Configuratori personalizzati', 'Configuratori prodotto e preventivatori', 60);

insert into public.app_settings (key, value)
values
  ('fiscal.default_tax_rate', 'null'::jsonb),
  ('quotes.show_prices_on_public_site', 'true'::jsonb),
  ('catalog.list_version', '1'::jsonb)
on conflict (key) do update set value = excluded.value;
