-- Prueba RLS de MenúYA con dos usuarios (A y B) y anon.
-- TODO se revierte: el bloque siempre termina en RAISE EXCEPTION, así que ninguna fila
-- (ni en auth.users ni en tablas menuya_) queda guardada. Ejecutar con:
--   supabase db query --linked --project-ref icohpikxtlqhkpvmvtuv -f tests/rls_test.sql
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  n int;
  r text := '';
  t text;
  tables text[] := array['menuya_profiles','menuya_baseline_orders','menuya_waste_logs','menuya_impulse_logs','menuya_events'];
  procedure_ok boolean;
begin
  insert into auth.users (id, aud, role, email)
  values (a, 'authenticated', 'authenticated', 'rls-a@test.invalid'),
         (b, 'authenticated', 'authenticated', 'rls-b@test.invalid');

  -- ===== Usuario A crea una fila en cada tabla =====
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  insert into public.menuya_profiles (user_id, city, grocery_band, consent_at) values (a, 'Narvarte', '2500-3500', now());
  insert into public.menuya_baseline_orders (label, amount_mxn) values ('antojo', 150);
  insert into public.menuya_waste_logs (log_date, item, amount_mxn, week) values (current_date, 'espinaca', 28, 1);
  insert into public.menuya_impulse_logs (log_date, kind, amount_mxn, week) values (current_date, 'delivery', 180, 1);
  insert into public.menuya_events (name) values ('log_added');
  foreach t in array tables loop
    execute format('select count(*) from public.%I', t) into n;
    r := r || format('[A ve sus filas en %s: %s] ', t, n);
  end loop;

  -- ===== Usuario B intenta leer, editar, borrar e insertar como A =====
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  foreach t in array tables loop
    execute format('select count(*) from public.%I', t) into n;
    r := r || format('[B lee %s de A: %s filas] ', t, n);
    execute format('delete from public.%I where user_id = %L', t, a);
    get diagnostics n = row_count;
    r := r || format('[B borra %s de A: %s] ', t, n);
  end loop;
  update public.menuya_profiles set city = 'hackeado' where user_id = a;
  get diagnostics n = row_count;
  r := r || format('[B edita perfil de A: %s] ', n);
  begin
    insert into public.menuya_waste_logs (user_id, log_date, item, amount_mxn, week) values (a, current_date, 'falso', 10, 1);
    r := r || '[B inserta a nombre de A: PERMITIDO ❌] ';
  exception when insufficient_privilege then r := r || '[B inserta a nombre de A: bloqueado] ';
  end;
  begin
    insert into public.menuya_events (user_id, name) values (a, 'pay_link_clicked');
    r := r || '[B inserta evento a nombre de A: PERMITIDO ❌] ';
  exception when insufficient_privilege then r := r || '[B inserta evento a nombre de A: bloqueado] ';
  end;

  -- ===== Validación en la base (11A.3, respaldo de zod) como usuario B, sus propias filas =====
  begin insert into public.menuya_waste_logs (log_date, item, amount_mxn, week) values (current_date, 'x', -5, 1);
    r := r || '[DB monto -5: ACEPTADO ❌] '; exception when check_violation then r := r || '[DB monto -5: rechazado] '; end;
  begin insert into public.menuya_waste_logs (log_date, item, amount_mxn, week) values (current_date, 'x', 999999, 1);
    r := r || '[DB monto 999999: ACEPTADO ❌] '; exception when check_violation then r := r || '[DB monto 999999: rechazado] '; end;
  begin insert into public.menuya_waste_logs (log_date, item, amount_mxn, week) values (current_date, repeat('x', 500), 10, 1);
    r := r || '[DB texto 500: ACEPTADO ❌] '; exception when check_violation then r := r || '[DB texto 500: rechazado] '; end;
  begin insert into public.menuya_impulse_logs (log_date, kind, amount_mxn, week) values (current_date, 'rappi', 10, 1);
    r := r || '[DB kind rappi: ACEPTADO ❌] '; exception when check_violation then r := r || '[DB kind rappi: rechazado] '; end;
  begin insert into public.menuya_waste_logs (log_date, item, amount_mxn, week) values (current_date, 'x', 10, 3);
    r := r || '[DB semana 3: ACEPTADO ❌] '; exception when check_violation then r := r || '[DB semana 3: rechazado] '; end;
  begin insert into public.menuya_events (name, props) values ('elcsa_score', '{"score": 8}');
    r := r || '[DB evento inventado elcsa_score: ACEPTADO ❌] '; exception when check_violation then r := r || '[DB evento inventado elcsa_score: rechazado] '; end;

  begin insert into public.menuya_events (name, props) values ('elcsa_completed', '{"score": 8}');
    r := r || '[DB evento con props score: ACEPTADO ❌] '; exception when check_violation then r := r || '[DB evento con props score: rechazado] '; end;
  begin insert into public.menuya_events (name, props) values ('log_added', '{"type": "waste", "week": 1}');
    r := r || '[DB evento válido log_added: aceptado] '; exception when check_violation then r := r || '[DB evento válido log_added: RECHAZADO ❌] '; end;

  -- ===== anon no ve nada =====
  execute 'set local role anon';
  foreach t in array tables loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      r := r || format('[anon lee %s: %s filas ❌] ', t, n);
    exception when insufficient_privilege then r := r || format('[anon %s: sin permiso] ', t);
    end;
  end loop;

  raise exception 'RESULTADOS (todo revertido): %', r;
end $$;
