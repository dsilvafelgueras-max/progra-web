import { createServerClient } from '../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

// POST /api/cart/:productId — agrega o actualiza un item en el carrito
// Body: { quantity }   (si no se manda, quantity = 1)
export async function POST(request, ctx) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { productId } = await ctx.params;
  const supabase = createServerClient();
  const body = await request.json().catch(() => ({}));
  const quantity = body.quantity ?? 1;

  // Upsert: inserta si no existe, actualiza si ya está
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: user.id, product_id: productId, quantity },
      { onConflict: 'user_id,product_id' }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data, { status: 201 });
}

// DELETE /api/cart/:productId — elimina un item del carrito
export async function DELETE(request, ctx) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { productId } = await ctx.params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
