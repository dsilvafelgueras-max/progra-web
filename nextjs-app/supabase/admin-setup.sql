-- ================================================================
-- Admin setup — agregar is_admin a profiles
-- Pegá esto en: supabase.com → tu proyecto → SQL Editor → Run
-- ================================================================

-- 1. Agregar columna is_admin (default false para todos)
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 2. Hacer admin a tu usuario
--    Reemplazá 'tu@email.com' con tu email real
update public.profiles
set is_admin = true
where email = 'tu@email.com';

-- Para verificar:
-- select id, email, full_name, is_admin from public.profiles;
