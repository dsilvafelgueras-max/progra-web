import { createServerClient } from '../../../../lib/supabase-server';

// GET /api/products/:id
export async function GET(_req, ctx) {
  const { id } = await ctx.params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  return Response.json(data);
}

// PUT /api/products/:id — actualiza un producto
export async function PUT(request, ctx) {
  const { id } = await ctx.params;
  const supabase = createServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data);
}

// DELETE /api/products/:id
export async function DELETE(_req, ctx) {
  const { id } = await ctx.params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
