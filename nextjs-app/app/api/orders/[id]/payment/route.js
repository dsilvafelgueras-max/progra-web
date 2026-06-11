import { Preference } from 'mercadopago';
import { getMpClient } from '../../../../../lib/mercadopago';
import { createServerClient } from '../../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../../lib/auth';

// POST /api/orders/:id/payment — crea una preferencia de Mercado Pago para la orden
export async function POST(request, ctx) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createServerClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      order_items (
        product_name,
        quantity,
        price_ars
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !order) {
    return Response.json({ error: 'Orden no encontrada' }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const items = (order.order_items ?? []).map((item) => ({
    title: item.product_name,
    quantity: item.quantity,
    unit_price: Number(item.price_ars),
    currency_id: 'ARS',
  }));

  const preference = await new Preference(getMpClient()).create({
    body: {
      items,
      external_reference: order.id,
      back_urls: {
        success: `${siteUrl}/pedido/${order.id}?mp_status=approved`,
        pending: `${siteUrl}/pedido/${order.id}?mp_status=pending`,
        failure: `${siteUrl}/pedido/${order.id}?mp_status=failure`,
      },
      auto_return: 'approved',
      notification_url: `${siteUrl}/api/payments/webhook`,
    },
  });

  await supabase
    .from('orders')
    .update({ mp_preference_id: preference.id })
    .eq('id', order.id);

  return Response.json({
    init_point: preference.init_point,
    sandbox_init_point: preference.sandbox_init_point,
  });
}
