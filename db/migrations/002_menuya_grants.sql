-- MenúYA · 002 · GRANTs explícitos (cambio de Supabase: Data API exige GRANT por tabla)
-- Solo toca tablas menuya_. No modifica tablas de mapa-tandeo ni default privileges.

revoke all on public.menuya_profiles from anon, authenticated;
grant select, insert, update, delete on public.menuya_profiles to authenticated;
grant select, insert, update, delete on public.menuya_profiles to service_role;
alter table public.menuya_profiles enable row level security;
