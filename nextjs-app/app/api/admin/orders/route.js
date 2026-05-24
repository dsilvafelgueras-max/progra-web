import { createServerClient } from '../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

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

// GET /api/admin/orders — todas las órdenes (solo admins)
export async function GET(request) {
  const supabase = createServerClient();
  const { error: authError } = await requireAdmin(request, supabase);
  if (authError) return authError;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      total,
      status,
      delivery_method,
      address,
      city,
      full_name,
      email,
      phone,
      user_id,
      order_items (
        product_id,
        product_name,
        quantity,
        price_ars
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Normalizar items
  const orders = data.map((order) => ({
    ...order,
    items: (order.order_items ?? []).map((item) => ({
      product_id: item.product_id,
      name:       item.product_name,
      priceArs:   item.price_ars,
      quantity:   item.quantity,
    })),
    order_items: undefined,
  }));

  return Response.json(orders);
}
