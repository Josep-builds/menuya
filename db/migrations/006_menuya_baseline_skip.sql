-- MenúYA · 006 · Persona test: la línea base pasa a ser opcional ("Saltar por ahora").
-- Saltar registra baseline_done con orders = 0, que marca el día 1 de la prueba.
-- Solo cambia el check de props de menuya_events (nada de mapa-tandeo).

alter table public.menuya_events drop constraint if exists menuya_events_props_allowed;
alter table public.menuya_events add constraint menuya_events_props_allowed check (
  props - array['type','week','orders'] = '{}'::jsonb
  and (not props ? 'type'   or props->>'type' in ('waste','impulse','nothing'))
  and (not props ? 'week'   or props->'week' in ('1'::jsonb, '2'::jsonb))
  and (not props ? 'orders' or props->'orders' in ('0','1','2','3','4','5','6','7','8','9','10'))
);
