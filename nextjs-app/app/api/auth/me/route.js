import { createServerClient } from '../../../../lib/supabase-server';
import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

// GET /api/auth/me — usuario actual + perfil
// Header: Authorization: Bearer <access_token>
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  const supabase = createServerClient();

  // Traer perfil extendido
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, address, city')
    .eq('id', user.id)
    .single();

  return Response.json({
    id:      user.id,
    email:   user.email,
    name:    profile?.full_name ?? user.user_metadata?.name ?? null,
    phone:   profile?.phone    ?? null,
    address: profile?.address  ?? null,
    city:    profile?.city     ?? null,
  });
}
