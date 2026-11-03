-- MenúYA · 001 · perfiles
-- Se aplica en el proyecto Supabase compartido "mapa-tandeo".
-- Regla: solo crea objetos con prefijo menuya_; no toca nada existente.
-- No se registra en supabase_migrations (ese historial pertenece a mapa-tandeo).

create table if not exists public.menuya_profiles (
  user_id      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  city         text check (city is null or char_length(city) between 2 and 60),
  grocery_band text check (grocery_band is null or grocery_band in ('<2500', '2500-3500', '>3500')),
  consent_at   timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.menuya_profiles enable row level security;

drop policy if exists menuya_profiles_select on public.menuya_profiles;
drop policy if exists menuya_profiles_insert on public.menuya_profiles;
drop policy if exists menuya_profiles_update on public.menuya_profiles;
drop policy if exists menuya_profiles_delete on public.menuya_profiles;

create policy menuya_profiles_select on public.menuya_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy menuya_profiles_insert on public.menuya_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy menuya_profiles_update on public.menuya_profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy menuya_profiles_delete on public.menuya_profiles
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.menuya_profiles from anon;
grant select, insert, update, delete on public.menuya_profiles to authenticated;
