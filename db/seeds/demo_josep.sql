-- DATOS DE DEMOSTRACIÓN (inventados) para la cuenta del fundador, para capturas del persona test.
-- Hoy (2026-11-04, CDMX) = día 14. Semana 1: 22–28 oct. Semana 2: 29 oct–4 nov (hoy vacío).
-- Cifras inspiradas en las entrevistas (desperdicio semana 1 ≈ $90–130). No crea eventos.
-- Se niega a correr si la cuenta ya tiene línea base o registros. Limpieza: db/seeds/demo_josep_cleanup.sql
do $$
declare
  u uuid;
  d0 date := date '2026-10-22';
begin
  select id into u from auth.users where email = 'josep.builds@gmail.com';
  if u is null then raise exception 'No existe la cuenta'; end if;
  if not exists (select 1 from public.menuya_profiles where user_id = u and consent_at is not null) then
    raise exception 'La cuenta no tiene consentimiento';
  end if;
  if exists (select 1 from public.menuya_baseline_orders where user_id = u)
     or exists (select 1 from public.menuya_waste_logs where user_id = u)
     or exists (select 1 from public.menuya_impulse_logs where user_id = u) then
    raise exception 'La cuenta ya tiene datos; no siembro encima';
  end if;

  -- Línea base: 10 pedidos (perfil parecido a U1/U2), día 1 a mediodía CDMX
  insert into public.menuya_baseline_orders (user_id, label, amount_mxn, created_at)
  select u, l, a, (d0 + time '12:00') at time zone 'America/Mexico_City'
  from (values ('antojo',165),('antojo',142),('antojo',189),
               ('no_planee',158),('no_planee',134),('no_planee',176),
               ('no_tuve_tiempo',149),('no_tuve_tiempo',171),
               ('alcohol_tabaco',220),('alcohol_tabaco',95)) v(l, a);

  -- Comida tirada (día = offset desde d0)
  insert into public.menuya_waste_logs (user_id, log_date, item, amount_mxn, week, created_at)
  select u, d0 + o, i, a, case when o < 7 then 1 else 2 end,
         (d0 + o + time '21:00') at time zone 'America/Mexico_City'
  from (values
    -- semana 1: $118
    (0,'Bolsa de espinaca (demo)',28),
    (1,'Tortillas duras (demo)',18),
    (3,'Pechuga de pollo (demo)',45),
    (4,'Jitomates (demo)',15),
    (6,'Pan de caja (demo)',12),
    (2,'Nada hoy',0),
    -- semana 2: $52
    (7,'Tortillas (demo)',12),
    (9,'Plátanos (demo)',14),
    (11,'Crema (demo)',26),
    (8,'Nada hoy',0),
    (10,'Nada hoy',0)
  ) v(o, i, a);

  -- Compras no planeadas
  insert into public.menuya_impulse_logs (user_id, log_date, kind, amount_mxn, week, created_at)
  select u, d0 + o, k, a, case when o < 7 then 1 else 2 end,
         (d0 + o + time '22:30') at time zone 'America/Mexico_City'
  from (values
    -- semana 1: $247
    (4,'delivery',189),
    (5,'oxxo',58),
    -- semana 2: $239
    (12,'delivery',175),
    (12,'oxxo',64)
  ) v(o, k, a);
end $$;

select
  (select sum(amount_mxn) from public.menuya_waste_logs w join auth.users x on x.id = w.user_id where x.email='josep.builds@gmail.com' and week=1) waste_w1,
  (select sum(amount_mxn) from public.menuya_waste_logs w join auth.users x on x.id = w.user_id where x.email='josep.builds@gmail.com' and week=2) waste_w2,
  (select sum(amount_mxn) from public.menuya_impulse_logs w join auth.users x on x.id = w.user_id where x.email='josep.builds@gmail.com' and week=1) impulse_w1,
  (select sum(amount_mxn) from public.menuya_impulse_logs w join auth.users x on x.id = w.user_id where x.email='josep.builds@gmail.com' and week=2) impulse_w2,
  (select count(*) from public.menuya_baseline_orders b join auth.users x on x.id = b.user_id where x.email='josep.builds@gmail.com') baseline;
