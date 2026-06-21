import { createServerClient } from '../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

// DELETE /api/favorites/:productId — eliminar favorito
export async function DELETE(request, ctx) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { productId } = await ctx.params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
