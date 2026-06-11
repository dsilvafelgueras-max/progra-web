import { createServerClient } from './supabase-server';

// Extrae el usuario autenticado del Authorization header.
// El cliente debe enviar: Authorization: Bearer <access_token>
export async function getUserFromRequest(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const supabase = createServerClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  return user;
}

// Respuesta de error 401 lista para usar en cualquier route
export function unauthorized() {
  return Response.json({ error: 'No autorizado' }, { status: 401 });
}
