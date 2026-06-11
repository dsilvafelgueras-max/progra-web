import { createServerClient } from '../../../lib/supabase-server';

// POST /api/newsletter
// Body: { email }
export async function POST(request) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    return Response.json({ error: 'No se pudo guardar el email.' }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
