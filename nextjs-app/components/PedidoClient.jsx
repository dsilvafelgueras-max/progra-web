'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/currency';

const STATUS_LABEL = {
  pending:   'Pendiente de confirmación',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const PAYMENT_STATUS_LABEL = {
  pending:    'Pendiente',
  in_process: 'En proceso',
  approved:   'Aprobado',
  rejected:   'Rechazado',
  cancelled:  'Cancelado',
};

const MP_STATUS_MESSAGE = {
  approved: '¡Pago aprobado! Ya estamos procesando tu pedido.',
  pending:  'Estamos procesando tu pago. Te avisamos por e-mail cuando se confirme.',
  failure:  'El pago no pudo procesarse. Podés intentar de nuevo desde tu cuenta.',
};

const BANK_INFO = [
  { label: 'Banco',   value: 'Banco Galicia' },
  { label: 'Titular', value: 'SANGRIA' },
  { label: 'CBU',     value: '0070999920000000000000' },
  { label: 'Alias',   value: 'SANGRIA.JOYAS' },
];

const DELIVERY_LABEL = {
  domicilio: 'Envío a domicilio',
  encuentro: 'Punto de encuentro',
  retiro:    'Retiro en el local',
};

export default function PedidoClient({ orderId }) {
  const { currency, usdRate } = useCart();
  const searchParams = useSearchParams();
  const mpStatus = searchParams.get('mp_status');
  const paymentMethod = searchParams.get('payment_method');
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function fetchOrder() {
      const token = localStorage.getItem('sangria-token');

      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Orden no encontrada');
        setOrder(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) return (
    <main className="react-content pedido-page">
      <p className="pedido-loading">Cargando pedido…</p>
    </main>
  );

  if (error || !order) return (
    <main className="react-content pedido-page">
      <div className="pedido-confirmado">
        <p className="eyebrow">Listo</p>
        <h2>Pedido confirmado</h2>
        <p className="pedido-subtitle">
          Gracias por tu compra. Nos ponemos en contacto a la brevedad.
        </p>
        <Link href="/" className="pedido-back-link">seguir comprando</Link>
      </div>
    </main>
  );

  const total = order.items?.reduce((acc, item) => acc + item.priceArs * item.quantity, 0) ?? order.total;

  return (
    <main className="react-content pedido-page">

      <div className="pedido-header">
        <p className="eyebrow">Confirmado</p>
        <h2>¡Gracias por tu compra!</h2>
        <p className="pedido-subtitle">
          Te contactamos a <strong>{order.email}</strong> a la brevedad.
        </p>
      </div>

      {mpStatus && MP_STATUS_MESSAGE[mpStatus] && (
        <p className={`pedido-mp-status is-${mpStatus}`}>{MP_STATUS_MESSAGE[mpStatus]}</p>
      )}

      {paymentMethod === 'transferencia' && (
        <div className="checkout-payment-panel pedido-payment-panel">
          <div className="checkout-bank-info">
            {BANK_INFO.map(({ label, value }) => (
              <p key={label}><span>{label}</span><strong>{value}</strong></p>
            ))}
          </div>
          <p className="checkout-bank-note">Una vez realizada la transferencia, envianos el comprobante por Instagram o por correo para confirmar tu pedido.</p>
        </div>
      )}

      {paymentMethod === 'efectivo' && (
        <div className="checkout-payment-panel pedido-payment-panel">
          <p className="checkout-bank-note">Vas a pagar en efectivo al momento del retiro o encuentro. Te contactamos para coordinar.</p>
        </div>
      )}

      <div className="pedido-card">

        {/* Número de pedido */}
        <div className="pedido-row pedido-row--id">
          <span className="pedido-label">Número de pedido</span>
          <span className="pedido-value pedido-id">{order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        {/* Estado */}
        <div className="pedido-row">
          <span className="pedido-label">Estado</span>
          <span className={`pedido-badge is-${order.status}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* Estado de pago */}
        <div className="pedido-row">
          <span className="pedido-label">Pago</span>
          <span className={`pedido-badge is-${order.payment_status}`}>
            {PAYMENT_STATUS_LABEL[order.payment_status] ?? order.payment_status}
          </span>
        </div>

        {/* Fecha */}
        <div className="pedido-row">
          <span className="pedido-label">Fecha</span>
          <span className="pedido-value">
            {new Date(order.created_at).toLocaleDateString('es-AR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
        </div>

        {/* Entrega */}
        <div className="pedido-row">
          <span className="pedido-label">Entrega</span>
          <span className="pedido-value">
            {DELIVERY_LABEL[order.delivery_method] ?? order.delivery_method}
            {order.delivery_method === 'domicilio' && order.address
              ? ` — ${order.address}, ${order.city}`
              : ''}
          </span>
        </div>

        {/* Datos de contacto */}
        <div className="pedido-row">
          <span className="pedido-label">Contacto</span>
          <span className="pedido-value">{order.full_name} · {order.phone}</span>
        </div>

        {/* Divisor */}
        <div className="pedido-divider" />

        {/* Items */}
        <div className="pedido-items">
          {order.items?.map((item, i) => (
            <div key={i} className="pedido-item">
              <span>{item.name} <span className="pedido-qty">× {item.quantity}</span></span>
              <span>{formatMoney(item.priceArs * item.quantity, currency, usdRate)}</span>
            </div>
          ))}
        </div>

        <div className="pedido-total">
          <span>Total</span>
          <strong>{formatMoney(total, currency, usdRate)}</strong>
        </div>

      </div>

      <div className="pedido-actions">
        <Link href="/cuenta" className="pedido-back-link">ver mis pedidos</Link>
        <Link href="/" className="pedido-back-link is-ghost">seguir comprando</Link>
      </div>

    </main>
  );
}
