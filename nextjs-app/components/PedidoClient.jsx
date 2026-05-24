'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../lib/currency';

const STATUS_LABEL = {
  pending:   'Pendiente de confirmación',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const DELIVERY_LABEL = {
  domicilio: 'Envío a domicilio',
  encuentro: 'Punto de encuentro',
  retiro:    'Retiro en el local',
};

export default function PedidoClient({ orderId }) {
  const { currency, usdRate } = useCart();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function fetchOrder() {
      const token = localStorage.getItem('sangria-token');
      if (!token) { setError('No hay sesión activa.'); setLoading(false); return; }

      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
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
