-- ================================================================
-- SANGRIA — Schema de Supabase
-- Pegá este SQL en: supabase.com → tu proyecto → SQL Editor → Run
-- ================================================================

-- ── Productos ────────────────────────────────────────────────────

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  price_ars   numeric not null,
  image       text,
  description text,
  created_at  timestamptz default now()
);

-- Lectura pública (cualquiera puede ver productos)
alter table public.products enable row level security;
create policy "productos visibles para todos"
  on public.products for select using (true);

-- Solo el service role puede insertar/editar/borrar
-- (las API routes usan el service role key, así que tienen acceso)

-- ── Órdenes ──────────────────────────────────────────────────────

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  items           jsonb not null,     -- [{ id, name, priceArs, quantity }]
  total           numeric not null,
  status          text not null default 'pending',
  delivery_method text,
  address         text,
  city            text,
  full_name       text,
  email           text,
  phone           text,
  created_at      timestamptz default now()
);

alter table public.orders enable row level security;

-- Cada usuario solo ve sus propias órdenes
create policy "usuarios ven sus ordenes"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus ordenes"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- ── Carrito persistente ───────────────────────────────────────────

create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  product_id  uuid references public.products(id) on delete cascade not null,
  quantity    integer not null default 1 check (quantity > 0),
  updated_at  timestamptz default now(),
  unique (user_id, product_id)  -- una fila por producto/usuario → upsert funciona
);

alter table public.cart_items enable row level security;

create policy "usuarios ven su carrito"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "usuarios modifican su carrito"
  on public.cart_items for all
  using (auth.uid() = user_id);

-- ── Datos iniciales (productos del catalog.js) ────────────────────
-- Corré esto DESPUÉS de crear las tablas para poblar products

insert into public.products (name, category, price_ars, image, description) values
  ('Pulsera Onda',           'Pulseras', 138000, '/products/pulsera-onda-catalogo.png',   'Pulsera ancha con capas fluidas y gesto organico en plata.'),
  ('Anillo Torsion',         'Anillos',   74000, '/products/anillo-torsion.jpg',           'Anillo fino con relieve irregular y perfil de torsion.'),
  ('Anillo Escultura',       'Anillos',   82000, '/products/anillo-escultura.jpg',         'Anillo escultorico de volumen suave con presencia minima.'),
  ('Anillo Sello Crudo',     'Anillos',   91000, '/products/anillo-sello-catalogo.png',    'Sello texturado con superficie erosionada y caracter bruto.'),
  ('Anillo Organico Plata',  'Anillos',   97000, '/products/anillo-dorado-plata.jpg',      'Anillo de plata calida con textura erosionada y volumen irregular.'),
  ('Anillo Vintage Ornamental','Anillos', 102000,'/products/anillo-vintage.png',           'Anillo de plata con frente ornamental y presencia simetrica.'),
  ('Anillo Gema Verde',      'Anillos',  118000, '/products/anillo-gema-verde.png',        'Anillo de plata con gema verde tallada y marco irregular.'),
  ('Anillo Espiral Plata',   'Anillos',   89000, '/products/anillo-espiral-plata.png',     'Anillo de plata pulida con forma envolvente y gesto fluido.'),
  ('Anillo Fluido Plata',    'Anillos',   94000, '/products/anillo-fluido-plata.png',      'Anillo ancho de plata con pliegues suaves y volumen escultorico.'),
  ('Anillo Magma',           'Anillos',  106000, '/products/anillo-pina.jpg',              'Anillo ancho de plata con relieve organico y ondas suaves.'),
  ('Earcuff Crudo',          'Earcuff',   68000, '/products/earcuff-crudo.png',            'Earcuff de plata con forma organica y textura irregular.'),
  ('Argolla Lisa',           'Aros',      78000, '/products/aros-1.png',                   'Aro argolla de plata con superficie texturada y perfil irregular.'),
  ('Argolla Organica',       'Aros',      85000, '/products/aros-2.png',                   'Aro argolla de plata con relieve organico y volumen escultorico.'),
  ('Gema Azul',              'Earcuff',   92000, '/products/earcuff-gema-azul.png',        'Earcuff de plata con gema azul engastada en montura irregular.'),
  ('Gema Dorada',            'Earcuff',   92000, '/products/earcuff-2.png',                'Earcuff de plata con gema dorada engastada en montura organica.'),
  ('Cuff Plata',             'Earcuff',   72000, '/products/earcuff-3.png',                'Earcuff ancho de plata pulida con gesto fluido y apertura lateral.');
