-- RUN THIS after the two APPLY_NOW schema migrations.
-- Needed because "Automatically expose new tables" was disabled.
-- Grants API access; RLS policies still control what each role can see/do.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;

grant usage, select on all sequences in schema public
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant usage, select on sequences
  to anon, authenticated, service_role;

-- Storage policies already exist in initial schema; ensure bucket access roles
-- (no-op if already present)
notify pgrst, 'reload schema';
