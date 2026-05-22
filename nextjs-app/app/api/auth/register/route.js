import { createServerClient } from '../../../../lib/supabase-server';

// POST /api/auth/register
// Body: { email, password, name }
export async function POST(request) {
  const supabase = createServerClient();
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return Response.json(
      { error: 'Faltan campos: email, password, name' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(
    {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
      session: data.session,
    },
    { status: 201 }
  );
}
