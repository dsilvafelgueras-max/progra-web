-- ================================================================
-- SANGRIA — Schema completo desde cero
-- Pegá esto en: supabase.com → tu proyecto → SQL Editor → Run
-- ================================================================


-- ── 0. LIMPIAR todo lo anterior ───────────────────────────────────
-- Borra en orden inverso a las dependencias (foreign keys primero)

drop trigger  if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.cart_items   cascade;
drop table if exists public.order_items  cascade;
drop table if exists public.orders       cascade;
drop table if exists public.profiles     cascade;
drop table if exists public.products     cascade;


-- ── 1. PRODUCTS ───────────────────────────────────────────────────
-- id es TEXT para coincidir con los IDs del catálogo ("anillo-torsion", etc.)

create table public.products (
  id          text primary key,
  name        text not null,
  category    text not null,
  price_ars   numeric not null,
  image       text,
  description text,
  created_at  timestamptz default now()
);

alter table public.products enable row level security;

create policy "productos visibles para todos"
  on public.products for select using (true);


-- ── 2. PROFILES ───────────────────────────────────────────────────
-- Extiende auth.users con datos extra del usuario

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  address     text,
  city        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "usuarios ven su perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "usuarios editan su perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "service role inserta perfiles"
  on public.profiles for insert
  with check (true);

-- Trigger: crea perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 3. ORDERS ─────────────────────────────────────────────────────

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade,
  total            numeric not null,
  status           text not null default 'pending',
  payment_status   text not null default 'pending',
  mp_payment_id    text,
  mp_preference_id text,
  delivery_method  text,
  address          text,
  city             text,
  full_name        text,
  email            text,
  phone            text,
  created_at       timestamptz default now()
);

alter table public.orders enable row level security;

create policy "usuarios ven sus ordenes"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus ordenes"
  on public.orders for insert
  with check (auth.uid() = user_id);


-- ── 4. ORDER_ITEMS ────────────────────────────────────────────────
-- Items de órdenes como tabla normalizada (en vez de JSONB)

create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references public.orders(id) on delete cascade not null,
  product_id   text references public.products(id) not null,
  product_name text not null,
  quantity     integer not null check (quantity > 0),
  price_ars    numeric not null
);

alter table public.order_items enable row level security;

create policy "usuarios ven sus order_items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "service role inserta order_items"
  on public.order_items for insert
  with check (true);


-- ── 5. CART_ITEMS ─────────────────────────────────────────────────

create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  product_id  text references public.products(id) on delete cascade not null,
  quantity    integer not null default 1 check (quantity > 0),
  updated_at  timestamptz default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "usuarios ven su carrito"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "usuarios modifican su carrito"
  on public.cart_items for all
  using (auth.uid() = user_id);


-- ── 6. SEED — productos del catálogo ─────────────────────────────

insert into public.products (id, name, category, price_ars, image, description) values
  ('pulsera-onda',         'Pulsera Onda',              'Pulseras', 138000, '/products/pulsera-onda-catalogo.png',  'Pulsera ancha con capas fluidas y gesto organico en plata.'),
  ('anillo-torsion',       'Anillo Torsion',             'Anillos',   74000, '/products/anillo-torsion.jpg',          'Anillo fino con relieve irregular y perfil de torsion.'),
  ('anillo-escultura',     'Anillo Escultura',           'Anillos',   82000, '/products/anillo-escultura.jpg',        'Anillo escultorico de volumen suave con presencia minima.'),
  ('anillo-sello',         'Anillo Sello Crudo',         'Anillos',   91000, '/products/anillo-sello-catalogo.png',   'Sello texturado con superficie erosionada y caracter bruto.'),
  ('anillo-dorado',        'Anillo Organico Plata',      'Anillos',   97000, '/products/anillo-dorado-plata.jpg',     'Anillo de plata calida con textura erosionada y volumen irregular.'),
  ('anillo-vintage',       'Anillo Vintage Ornamental',  'Anillos',  102000, '/products/anillo-vintage.png',          'Anillo de plata con frente ornamental y presencia simetrica.'),
  ('anillo-gema-verde',    'Anillo Gema Verde',          'Anillos',  118000, '/products/anillo-gema-verde.png',       'Anillo de plata con gema verde tallada y marco irregular.'),
  ('anillo-espiral-plata', 'Anillo Espiral Plata',       'Anillos',   89000, '/products/anillo-espiral-plata.png',    'Anillo de plata pulida con forma envolvente y gesto fluido.'),
  ('anillo-fluido-plata',  'Anillo Fluido Plata',        'Anillos',   94000, '/products/anillo-fluido-plata.png',     'Anillo ancho de plata con pliegues suaves y volumen escultorico.'),
  ('anillo-magma',         'Anillo Magma',               'Anillos',  106000, '/products/anillo-pina.jpg',             'Anillo ancho de plata con relieve organico y ondas suaves.'),
  ('earcuff-crudo',        'Earcuff Crudo',              'Earcuff',   68000, '/products/earcuff-crudo.png',           'Earcuff de plata con forma organica y textura irregular.'),
  ('aro-argolla-lisa',     'Argolla Lisa',               'Aros',      78000, '/products/aros-1.png',                  'Aro argolla de plata con superficie texturada y perfil irregular.'),
  ('aro-argolla-organica', 'Argolla Organica',           'Aros',      85000, '/products/aros-2.png',                  'Aro argolla de plata con relieve organico y volumen escultorico.'),
  ('earcuff-gema-azul',    'Gema Azul',                  'Earcuff',   92000, '/products/earcuff-gema-azul.png',       'Earcuff de plata con gema azul engastada en montura irregular.'),
  ('earcuff-gema-dorada',  'Gema Dorada',                'Earcuff',   92000, '/products/earcuff-2.png',               'Earcuff de plata con gema dorada engastada en montura organica.'),
  ('earcuff-cuff-plata',   'Cuff Plata',                 'Earcuff',   72000, '/products/earcuff-3.png',               'Earcuff ancho de plata pulida con gesto fluido y apertura lateral.');
