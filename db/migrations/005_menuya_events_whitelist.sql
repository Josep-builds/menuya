-- MenúYA · 005 · FIX (prueba mecánica 11A): la base aceptaba cualquier nombre de evento y
-- cualquier props, así que alguien podía guardar p. ej. un puntaje ELCSA llamando a la API
-- directo con su sesión. Ahora la base solo acepta los 7 eventos y las 3 llaves de props
-- que usa la app (igual que el zod de src/lib/events.ts).

alter table public.menuya_events drop constraint if exists menuya_events_name_allowed;
alter table public.menuya_events add constraint menuya_events_name_allowed check (
  name in ('signed_in','consent_given','elcsa_completed','baseline_done','log_added','saving_viewed','pay_link_clicked')
);

alter table public.menuya_events drop constraint if exists menuya_events_props_allowed;
alter table public.menuya_events add constraint menuya_events_props_allowed check (
  props - array['type','week','orders'] = '{}'::jsonb
  and (not props ? 'type'   or props->>'type' in ('waste','impulse','nothing'))
  and (not props ? 'week'   or props->'week' in ('1'::jsonb, '2'::jsonb))
  and (not props ? 'orders' or props->'orders' in ('1','2','3','4','5','6','7','8','9','10'))
);
