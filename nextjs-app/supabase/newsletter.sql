-- ================================================================
-- SANGRIA — Tabla newsletter_subscribers
-- Pegá esto en: supabase.com → tu proyecto → SQL Editor → Run
-- ================================================================

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Cualquier visitante puede suscribirse (INSERT público)
create policy "suscripcion publica"
  on public.newsletter_subscribers for insert
  with check (true);

-- Solo el service role puede leer la lista (admin/backend)
-- Los usuarios anónimos no pueden ver los emails de otros
