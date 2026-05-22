import { createServerClient } from '../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

// GET /api/orders/:id — una orden específica del usuario
export async function GET(request, ctx) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // solo puede ver sus propias órdenes
    .single();

  if (error) {
    return Response.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  return Response.json(data);
}
