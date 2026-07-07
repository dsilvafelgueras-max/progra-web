import { createServerClient } from '../../../../lib/supabase-server';
import { isValidEmail, isValidName } from '../../../../lib/validation';

// POST /api/auth/register
// Body: { email, password, name }
export async function POST(request) {
  const supabase = createServerClient();
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return Response.json(
      { error: 'Completá todos los campos: nombre, email y contraseña.' },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return Response.json(
      { error: 'Ingresá un email válido.' },
      { status: 400 }
    );
  }

  if (!isValidName(name)) {
    return Response.json(
      { error: 'El nombre solo puede tener letras (sin números ni símbolos).' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: 'La contraseña debe tener al menos 6 caracteres.' },
      { status: 400 }
    );
  }

  // Usar admin.createUser con email_confirm: true para omitir
  // la confirmación por mail — el usuario puede loguearse de inmediato.
  let created, createError;
  try {
    ({ data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,      // ← omite confirmación de email
      user_metadata: { name },
    }));
  } catch (err) {
    // Ej: base de datos pausada/caída → fetch failed. No es culpa del email.
    console.error('[register] error de conexión:', err?.message ?? err);
    return Response.json(
      { error: 'El servicio no está disponible en este momento. Probá de nuevo en unos minutos.' },
      { status: 503 }
    );
  }

  if (createError) {
    // Mensaje legible para errores comunes
    const msg = createError.message.includes('already registered')
      ? 'Ya existe una cuenta con ese email. Intentá ingresar.'
      : createError.message;
    return Response.json({ error: msg }, { status: 400 });
  }

  // Iniciar sesión inmediatamente para devolver el token
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Usuario creado pero no se pudo loguear (raro) — igual avisar éxito
    return Response.json(
      { user: { id: created.user.id, email, name }, session: null },
      { status: 201 }
    );
  }

  return Response.json(
    {
      user: {
        id:    signIn.user.id,
        email: signIn.user.email,
        name:  signIn.user.user_metadata?.name,
      },
      session: signIn.session,   // el cliente guarda session.access_token
    },
    { status: 201 }
  );
}
