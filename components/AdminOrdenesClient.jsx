'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pendiente' },
  { value: 'shipped',   label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const DELIVERY_LABEL = {
  domicilio: 'Domicilio',
  encuentro: 'Encuentro',
  retiro:    'Retiro',
};

export default function AdminOrdenesClient() {
  const { user, profile, loading } = useAuth();
  const { currency, usdRate } = useCart();
  const router = useRouter();

  const [orders,  setOrders]  = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error,   setError]   = useState('');
  const [updating, setUpdating] = useState(null); // order id que se está actualizando

  // Redirigir si no es admin
  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      router.push('/');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (loading || !profile?.is_admin) return;

    async function fetchOrders() {
      const token = localStorage.getItem('sangria-token');
      try {
        const res = await fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('No autorizado');
        setOrders(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setFetching(false);
      }
    }
    fetchOrders();
  }, [loading, profile]);

  async function handleStatusChange(orderId, newStatus) {
    const token = localStorage.getItem('sangria-token');
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      // Actualizar estado local
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  }

  if (loading || fetching) return (
    <main className="react-content admin-page">
      <p className="admin-loading">Cargando órdenes…</p>
    </main>
  );

  if (error) return (
    <main className="react-content admin-page">
      <p className="admin-error">{error}</p>
    </main>
  );

  return (
    <main className="react-content admin-page">
      <div className="admin-header">
        <p className="eyebrow">Admin</p>
        <h2>Órdenes</h2>
        <p className="admin-subtitle">{orders.length} pedido{orders.length !== 1 ? 's' : ''} en total</p>
      </div>

      {orders.length === 0 ? (
        <p className="admin-empty">Todavía no hay pedidos.</p>
      ) : (
        <div className="admin-orders">
          {orders.map((order) => (
            <div key={order.id} className="admin-order-card">

              <div className="admin-order-top">
                <div className="admin-order-meta">
                  <span className="admin-order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="admin-order-date">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <select
                  className={`admin-status-select is-${order.status}`}
                  value={order.status}
                  disabled={updating === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="admin-order-customer">
                <strong>{order.full_name}</strong>
                <span>{order.email}</span>
                <span>{order.phone}</span>
                {order.delivery_method && (
                  <span>
                    {DELIVERY_LABEL[order.delivery_method] ?? order.delivery_method}
                    {order.delivery_method === 'domicilio' && order.address
                      ? ` — ${order.address}, ${order.city}`
                      : ''}
                  </span>
                )}
              </div>

              <div className="admin-order-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="admin-order-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatMoney(item.priceArs * item.quantity, currency, usdRate)}</span>
                  </div>
                ))}
              </div>

              <div className="admin-order-total">
                <span>Total</span>
                <strong>{formatMoney(order.total, currency, usdRate)}</strong>
              </div>

            </div>
          ))}
        </div>
      )}
    </main>
  );
}
