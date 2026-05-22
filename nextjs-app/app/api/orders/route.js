import { createServerClient } from '../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../lib/auth';

// GET /api/orders — órdenes del usuario autenticado
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// POST /api/orders — crea una orden nueva
// Body: { items, total, deliveryMethod, address, city, fullName, email, phone }
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const supabase = createServerClient();
  const body = await request.json();
  const { items, total, deliveryMethod, address, city, fullName, email, phone } = body;

  if (!items?.length || !total) {
    return Response.json({ error: 'Faltan datos de la orden' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      items,          // JSONB: [{ id, name, priceArs, quantity }]
      total,
      delivery_method: deliveryMethod,
      address: address ?? null,
      city: city ?? null,
      full_name: fullName,
      email,
      phone,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data, { status: 201 });
}
