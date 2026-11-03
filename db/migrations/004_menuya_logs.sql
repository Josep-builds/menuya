-- MenúYA · 004 · línea base + registros diarios. Solo objetos menuya_.

create table if not exists public.menuya_baseline_orders (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label      text not null check (label in ('antojo','no_planee','no_tuve_tiempo','alcohol_tabaco','otro')),
  amount_mxn int  not null check (amount_mxn between 0 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.menuya_waste_logs (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date   date not null,
  item       text not null check (char_length(item) between 1 and 60),
  amount_mxn int  not null check (amount_mxn between 0 and 2000),
  week       smallint not null check (week in (1,2)),
  created_at timestamptz not null default now()
);

create table if not exists public.menuya_impulse_logs (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date   date not null,
  kind       text not null check (kind in ('delivery','oxxo','otro')),
  amount_mxn int  not null check (amount_mxn between 0 and 2000),
  week       smallint not null check (week in (1,2)),
  created_at timestamptz not null default now()
);

create index if not exists menuya_baseline_orders_user_idx on public.menuya_baseline_orders (user_id);
create index if not exists menuya_waste_logs_user_date_idx on public.menuya_waste_logs (user_id, log_date);
create index if not exists menuya_impulse_logs_user_date_idx on public.menuya_impulse_logs (user_id, log_date);

do $$
declare t text;
begin
  foreach t in array array['menuya_baseline_orders','menuya_waste_logs','menuya_impulse_logs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t || '_insert', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t || '_delete', t);
    -- GRANTs explícitos: sin anon, sin update (un registro mal hecho se borra y se vuelve a capturar)
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, delete on public.%I to authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end $$;
