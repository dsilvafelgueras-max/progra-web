import { createServerClient } from '../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

// GET /api/orders/:id — una orden específica del usuario (con sus items)
export async function GET(request, ctx) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      total,
      status,
      payment_status,
      delivery_method,
      address,
      city,
      full_name,
      email,
      phone,
      order_items (
        product_id,
        product_name,
        quantity,
        price_ars
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)   // solo puede ver sus propias órdenes
    .single();

  if (error) {
    return Response.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  // Normalizar items al shape esperado por el frontend
  const items = (data.order_items ?? []).map((item) => ({
    product_id: item.product_id,
    name:       item.product_name,
    priceArs:   item.price_ars,
    quantity:   item.quantity,
  }));

  return Response.json({ ...data, items, order_items: undefined });
}
