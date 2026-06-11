import { createServerClient } from '../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

// GET /api/auth/profile — leer perfil del usuario
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email, phone, address, city, updated_at')
    .eq('id', user.id)
    .single();

  if (error) {
    return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  return Response.json(data);
}

// PATCH /api/auth/profile — actualizar perfil
// Body (todos opcionales): { fullName, phone, address, city }
export async function PATCH(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const { fullName, phone, address, city } = body;

  // Solo actualizar campos que llegaron en el body
  const updates = {};
  if (fullName  !== undefined) updates.full_name  = fullName;
  if (phone     !== undefined) updates.phone      = phone;
  if (address   !== undefined) updates.address    = address;
  if (city      !== undefined) updates.city       = city;
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length === 1) {
    // Solo updated_at — no hay nada que actualizar
    return Response.json({ error: 'No se enviaron campos para actualizar' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('full_name, email, phone, address, city, updated_at')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data);
}
