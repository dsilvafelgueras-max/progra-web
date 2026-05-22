import { createServerClient } from '../../../lib/supabase-server';

// GET /api/products — devuelve todos los productos
export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// POST /api/products — crea un producto (solo admin)
export async function POST(request) {
  const supabase = createServerClient();
  const body = await request.json();

  const { name, category, price_ars, image, description } = body;
  if (!name || !category || !price_ars) {
    return Response.json(
      { error: 'Faltan campos obligatorios: name, category, price_ars' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ name, category, price_ars, image, description })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data, { status: 201 });
}
