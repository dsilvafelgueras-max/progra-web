-- ================================================================
-- Admin setup — crea/asegura la cuenta de administrador
-- Pegá esto en: supabase.com → tu proyecto → SQL Editor → Run
-- ================================================================
--
-- Cuenta de administrador provista (E5):
--   email:    admin@sangria.com
--   password: Admin1234
--
-- Este script es reproducible: podés correrlo las veces que quieras.
-- ================================================================

-- 1. Asegurar la columna is_admin en profiles (default false para todos)
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 2. Crear el usuario admin en auth.users si no existe.
--    Usa la función de hashing de contraseñas de Supabase (extensión pgcrypto,
--    ya instalada en el esquema `extensions` de todo proyecto Supabase).
do $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'admin@sangria.com';

  if admin_id is null then
    admin_id := gen_random_uuid();
    insert into auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', 'admin@sangria.com',
      extensions.crypt('Admin1234', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Administradora"}',
      now(), now()
    );

    -- Identidad de email (requerida por Supabase Auth para login por password)
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), admin_id, admin_id::text,
      json_build_object('sub', admin_id::text, 'email', 'admin@sangria.com'),
      'email', now(), now(), now()
    );
  end if;

  -- 3. Asegurar el perfil y marcarlo como admin
  insert into public.profiles (id, full_name, email, is_admin)
  values (admin_id, 'Administradora', 'admin@sangria.com', true)
  on conflict (id) do update set is_admin = true;
end $$;

-- Para verificar:
-- select p.email, p.is_admin from public.profiles p where p.email = 'admin@sangria.com';
