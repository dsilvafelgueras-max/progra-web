-- Tabla de favoritos por usuario
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "usuarios ven sus favoritos"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "usuarios insertan sus favoritos"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "usuarios eliminan sus favoritos"
  on public.favorites for delete
  using (auth.uid() = user_id);
