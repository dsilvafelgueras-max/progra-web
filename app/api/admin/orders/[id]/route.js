import { createServerClient } from '../../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../../lib/auth';

const VALID_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];

async function requireAdmin(request, supabase) {
  const user = await getUserFromRequest(request);
  if (!user) return { error: unauthorized() };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: Response.json({ error: 'No autorizado' }, { status: 403 }) };
  }
  return { user };
}

// PATCH /api/admin/orders/:id — cambiar estado de una orden
// Body: { status: 'pending' | 'shipped' | 'delivered' | 'cancelled' }
export async function PATCH(request, ctx) {
  const supabase = createServerClient();
  const { error: authError } = await requireAdmin(request, supabase);
  if (authError) return authError;

  const { id } = await ctx.params;
  const body = await request.json();
  const { status } = body;

  if (!VALID_STATUSES.includes(status)) {
    return Response.json(
      { error: `Estado inválido. Valores posibles: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data);
}
