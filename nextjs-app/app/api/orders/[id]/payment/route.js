import { Preference } from 'mercadopago';
import { getMpClient } from '../../../../../lib/mercadopago';
import { createServerClient } from '../../../../../lib/supabase-server';
import { getUserFromRequest } from '../../../../../lib/auth';

// POST /api/orders/:id/payment — crea una preferencia de Mercado Pago para la orden
// Disponible tanto para usuarios logueados (sus propias órdenes) como invitados (órdenes sin user_id).
export async function POST(request, ctx) {
  const user = await getUserFromRequest(request);

  const { id } = await ctx.params;
  const supabase = createServerClient();

  let query = supabase
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
    .eq('id', id);

  query = user ? query.eq('user_id', user.id) : query.is('user_id', null);

  const { data: order, error } = await query.single();

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

  const isLocalhost = siteUrl?.includes('localhost') || siteUrl?.includes('127.0.0.1');

  let preference;
  try {
    preference = await new Preference(getMpClient()).create({
      body: {
        items,
        external_reference: order.id,
        back_urls: {
          success: `${siteUrl}/pedido/${order.id}?mp_status=approved`,
          pending: `${siteUrl}/pedido/${order.id}?mp_status=pending`,
          failure: `${siteUrl}/pedido/${order.id}?mp_status=failure`,
        },
        // auto_return requiere back_urls con dominio público (no funciona con localhost)
        ...(isLocalhost ? {} : { auto_return: 'approved' }),
        ...(!isLocalhost && { notification_url: `${siteUrl}/api/payments/webhook` }),
      },
    });
  } catch (err) {
    console.error('[MP] Error creando preferencia:', err?.message ?? err);
    return Response.json(
      { error: 'No se pudo crear la preferencia de pago', detail: err?.message },
      { status: 500 }
    );
  }

  console.log('[MP] init_point:', preference.init_point);
  console.log('[MP] sandbox_init_point:', preference.sandbox_init_point);

  await supabase
    .from('orders')
    .update({ mp_preference_id: preference.id })
    .eq('id', order.id);

  return Response.json({
    init_point: preference.init_point,
    sandbox_init_point: preference.sandbox_init_point,
  });
}
