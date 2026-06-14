import crypto from 'crypto';
import { Payment } from 'mercadopago';
import { getMpClient } from '../../../../lib/mercadopago';
import { createServerClient } from '../../../../lib/supabase-server';

// Valida la firma x-signature según el algoritmo de Mercado Pago:
// HMAC-SHA256("id:{data.id};request-id:{x-request-id};ts:{ts};", secret)
function isValidSignature(request, dataId) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // sin secret configurado, no se valida (solo para desarrollo inicial)

  const signatureHeader = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => part.trim().split('='))
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  return expected === v1;
}

// GET /api/payments/webhook — chequeo de conectividad usado por el panel de Mercado Pago
export async function GET() {
  return Response.json({ ok: true });
}

// POST /api/payments/webhook — notificaciones de Mercado Pago
export async function POST(request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));

  const type = body.type ?? url.searchParams.get('type');
  const dataId = body.data?.id ?? url.searchParams.get('data.id');

  if (type !== 'payment' || !dataId) {
    return Response.json({ received: true });
  }

  if (!isValidSignature(request, dataId)) {
    return Response.json({ error: 'Firma inválida' }, { status: 401 });
  }

  const payment = await new Payment(getMpClient()).get({ id: dataId });
  const orderId = payment.external_reference;

  if (orderId) {
    const supabase = createServerClient();
    await supabase
      .from('orders')
      .update({
        payment_status: payment.status,
        mp_payment_id: String(payment.id),
      })
      .eq('id', orderId);
  }

  return Response.json({ received: true });
}
