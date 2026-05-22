import { getUserFromRequest, unauthorized } from '../../../../lib/auth';
import { createServerClient } from '../../../../lib/supabase-server';

// POST /api/auth/logout
// Header: Authorization: Bearer <access_token>
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  // Invalida todos los tokens activos del usuario
  const supabase = createServerClient();
  await supabase.auth.admin.signOut(user.id, 'global');

  return Response.json({ success: true });
}
