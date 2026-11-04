-- Borra los datos de demostración de la cuenta del fundador (línea base + registros).
-- Deja perfil, consentimiento y eventos. Después de esto, /linea-base vuelve a aparecer.
delete from public.menuya_waste_logs   where user_id = (select id from auth.users where email = 'josep.builds@gmail.com');
delete from public.menuya_impulse_logs where user_id = (select id from auth.users where email = 'josep.builds@gmail.com');
delete from public.menuya_baseline_orders where user_id = (select id from auth.users where email = 'josep.builds@gmail.com');
