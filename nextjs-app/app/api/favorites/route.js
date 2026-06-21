import { createServerClient } from '../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../lib/auth';

// GET /api/favorites — favoritos del usuario logueado
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(data.map((f) => f.product_id));
}

// POST /api/favorites — agregar favorito { productId }
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { productId } = await request.json();
  if (!productId) return Response.json({ error: 'productId requerido' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, product_id: productId });

  if (error && !error.message.includes('duplicate')) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
