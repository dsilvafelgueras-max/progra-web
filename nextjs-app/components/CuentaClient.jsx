'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function CuentaClient() {
  const { user, logout, orders } = useAuth();
  const { currency, usdRate } = useCart();
  const router = useRouter();
  const [tab, setTab] = useState('pedidos');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !user) {
      router.push('/login');
    }
  }, [ready, user, router]);

  if (!ready || !user) return null;

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <main className="react-content cuenta-page">
      <div className="cuenta-tabs">
        <button
          type="button"
          className={tab === 'pedidos' ? 'is-active' : ''}
          onClick={() => setTab('pedidos')}
        >
          pedidos
        </button>
        <button
          type="button"
          className={tab === 'perfil' ? 'is-active' : ''}
          onClick={() => setTab('perfil')}
        >
          perfil
        </button>
      </div>

      {tab === 'pedidos' && (
        <div className="cuenta-section">
          {orders.length === 0 ? (
            <>
              <p className="cuenta-empty">todavía no realizaste ningún pedido.</p>
              <Link href="/" className="cuenta-link-outline">ver piezas</Link>
            </>
          ) : (
            <div className="cuenta-orders">
              {orders.map((order) => (
                <div key={order.id} className="cuenta-order">
                  <p className="cuenta-order-date">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {order.items.map((item, i) => (
                    <div key={i} className="cuenta-order-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatMoney(item.priceArs * item.quantity, currency, usdRate)}</span>
                    </div>
                  ))}
                  <div className="cuenta-order-total">
                    <span>Total</span>
                    <span>{formatMoney(order.total, currency, usdRate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'perfil' && (
        <div className="cuenta-section">
          <p className="cuenta-field">{user.name}</p>
          <p className="cuenta-field">{user.email}</p>
          <button type="button" className="cuenta-logout" onClick={handleLogout}>
            cerrar sesión
          </button>
        </div>
      )}
    </main>
  );
}
