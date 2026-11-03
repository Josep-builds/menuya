-- MenúYA · 003 · bitácora de eventos (sin datos sensibles; ELCSA nunca va aquí)
create table if not exists public.menuya_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  props      jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object' and pg_column_size(props) <= 2048),
  created_at timestamptz not null default now()
);
create index if not exists menuya_events_user_name_idx on public.menuya_events (user_id, name);

alter table public.menuya_events enable row level security;

drop policy if exists menuya_events_select on public.menuya_events;
drop policy if exists menuya_events_insert on public.menuya_events;
drop policy if exists menuya_events_delete on public.menuya_events;
create policy menuya_events_select on public.menuya_events
  for select to authenticated using ((select auth.uid()) = user_id);
create policy menuya_events_insert on public.menuya_events
  for insert to authenticated with check ((select auth.uid()) = user_id);
-- delete propio: solo para «Borrar mis datos»
create policy menuya_events_delete on public.menuya_events
  for delete to authenticated using ((select auth.uid()) = user_id);

-- GRANTs explícitos (sin anon; sin update: los eventos no se editan)
revoke all on public.menuya_events from anon, authenticated;
grant select, insert, delete on public.menuya_events to authenticated;
grant select, insert, update, delete on public.menuya_events to service_role;
