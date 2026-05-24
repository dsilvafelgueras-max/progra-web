import { createServerClient } from '../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../lib/auth';

// Formatea order_items al shape que espera el frontend
// { product_id, name, priceArs, quantity }
function formatItems(orderItems = []) {
  return orderItems.map((item) => ({
    product_id: item.product_id,
    name:       item.product_name,
    priceArs:   item.price_ars,
    quantity:   item.quantity,
  }));
}

// GET /api/orders — órdenes del usuario autenticado (con sus items)
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const supabase = createServerClient();
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
      order_items (
        product_id,
        product_name,
        quantity,
        price_ars
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Normalizar items al shape esperado por el frontend
  const orders = data.map((order) => ({
    ...order,
    items: formatItems(order.order_items),
    order_items: undefined, // no exponer el campo crudo
  }));

  return Response.json(orders);
}

// POST /api/orders — crea una orden nueva
// Body: { items, total, deliveryMethod, address, city, fullName, email, phone }
// items: [{ id, name, priceArs, quantity }]
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const supabase = createServerClient();
  const body = await request.json();
  const { items, total, deliveryMethod, address, city, fullName, email, phone } = body;

  if (!items?.length || !total) {
    return Response.json({ error: 'Faltan datos de la orden' }, { status: 400 });
  }

  // 1. Crear la orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id:         user.id,
      total,
      delivery_method: deliveryMethod,
      address:         address ?? null,
      city:            city ?? null,
      full_name:       fullName,
      email,
      phone,
      status:          'pending',
    })
    .select()
    .single();

  if (orderError) {
    return Response.json({ error: orderError.message }, { status: 400 });
  }

  // 2. Insertar los items en order_items
  const orderItems = items.map((item) => ({
    order_id:     order.id,
    product_id:   item.id,
    product_name: item.name,
    quantity:     item.quantity,
    price_ars:    item.priceArs,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // La orden se creó pero los items fallaron — loguear para debugging
    console.error('Error insertando order_items:', itemsError.message);
  }

  // 3. Devolver la orden con items formateados
  return Response.json(
    { ...order, items: formatItems(orderItems) },
    { status: 201 }
  );
}
