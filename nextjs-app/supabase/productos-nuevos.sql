-- ================================================================
-- SANGRIA — Agregar productos faltantes al catálogo
-- Pegá esto en: supabase.com → tu proyecto → SQL Editor → Run
-- ================================================================
-- Usa INSERT ... ON CONFLICT DO NOTHING para no romper nada si
-- algunos ya existen.

INSERT INTO public.products (id, name, category, price_ars, image, description)
VALUES
  -- Collares
  ('collar-gargantilla-toggle', 'Gargantilla Toggle', 'Collares', 101000,
   '/products/collar-toggle.png',
   'Gargantilla de plata con aro rigido, cadena y cierre toggle.'),

  ('collar-chain', 'Cadena Organica', 'Collares', 112000,
   '/products/collar-chain.png',
   'Collar de cadena en plata con eslabones organicos y textura irregular.'),

  ('collar-largo', 'Largo', 'Collares', 118000,
   '/products/collar-largo.png',
   'Collar largo de plata con caida fluida y acabado brunido.'),

  ('collar-escultorico', 'Escultorico', 'Collares', 127000,
   '/products/collar-escultorico.png',
   'Collar de plata con pieza central de volumen organico y presencia escultorica.'),

  -- Pulseras nuevas
  ('pulsera-cadena-toggle', 'Cadena Toggle', 'Pulseras', 131000,
   '/products/pulsera-cadena-toggle.png',
   'Pulsera de cadena con eslabones texturados y cierre toggle en plata.'),

  ('pulsera-cuff-lisa', 'Cuff Lisa', 'Pulseras', 146000,
   '/products/pulsera-cuff-lisa.png',
   'Pulsera rigida ancha con superficie pulida y volumen escultorico.'),

  ('pulsera-placa-organica', 'Placa Organica', 'Pulseras', 140000,
   '/products/pulsera-placa-organica.png',
   'Pulsera con placa de plata de forma irregular y eslabones articulados.'),

  ('pulsera-5', 'Amalta', 'Pulseras', 149000,
   '/products/pulsera-5.png',
   'Pulsera de plata con gesto organico y presencia escultorica.'),

  -- Anillos nuevos
  ('anillo-mineral', 'Mineral', 'Anillos', 101000,
   '/products/anillo-mineral.png',
   'Anillo de plata con volumen organico irregular y textura bruta.'),

  ('anillo-doble', 'Doble', 'Anillos', 88000,
   '/products/anillo-doble.png',
   'Anillo ancho de plata con doble banda y surco central.')

ON CONFLICT (id) DO NOTHING;
