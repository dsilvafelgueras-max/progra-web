import { createServerClient } from '../../../../lib/supabase-server';

// POST /api/auth/login
// Body: { email, password }
export async function POST(request) {
  const supabase = createServerClient();
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json(
      { error: 'Faltan campos: email, password' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return Response.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
  }

  return Response.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
    },
    // El cliente guarda este token y lo manda en cada request como:
    // Authorization: Bearer <access_token>
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  });
}
