import { createServerClient } from '../../../lib/supabase-server';
import { isValidEmail } from '../../../lib/validation';

// POST /api/newsletter
// Body: { email }
export async function POST(request) {
  const { email } = await request.json();

  if (!isValidEmail(email)) {
    return Response.json({ error: 'Ingresá un email válido.' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.code === '23505') {
      // unique violation — ya suscripto, no es un error real
      return Response.json({ ok: true, already: true });
    }
    console.error('[newsletter] error:', error.message);
    return Response.json(
      { error: 'El servicio no está disponible en este momento. Probá de nuevo en unos minutos.' },
      { status: 503 }
    );
  }

  return Response.json({ ok: true }, { status: 201 });
}
