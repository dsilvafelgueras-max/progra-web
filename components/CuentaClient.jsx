'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

export default function CuentaClient() {
  const { user, logout, orders, updateProfile } = useAuth();
  const { currency, usdRate } = useCart();
  const router = useRouter();
  const [tab, setTab] = useState('perfil');
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', city: '' });

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        city: user.city ?? '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (ready && !user) router.push('/login');
  }, [ready, user, router]);

  if (!ready || !user) return null;

  function handleLogout() {
    logout();
    router.push('/');
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    updateProfile(profile);
  }

  return (
    <main className="react-content cuenta-page">
      <header className="cuenta-header-react">
        <p className="eyebrow">Mi cuenta</p>
        <h1>Mi cuenta</h1>
        <p className="cuenta-mail-react">{user.email}</p>
      </header>

      <div className="cuenta-tabs">
        <button
          type="button"
          className={tab === 'perfil' ? 'is-active' : ''}
          onClick={() => setTab('perfil')}
        >
          perfil
        </button>
        <button
          type="button"
          className={tab === 'favoritos' ? 'is-active' : ''}
          onClick={() => setTab('favoritos')}
        >
          favoritos
        </button>
        <button
          type="button"
          className={tab === 'pedidos' ? 'is-active' : ''}
          onClick={() => setTab('pedidos')}
        >
          pedidos
        </button>
      </div>

      {tab === 'perfil' && (
        <div className="cuenta-section">
          <form className="cuenta-profile-form-react" onSubmit={handleSubmit}>
            <label>
              <span>Nombre</span>
              <input name="name" value={profile.name} onChange={handleChange} />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" value={profile.email} onChange={handleChange} />
            </label>
            <label>
              <span>Telefono</span>
              <input name="phone" value={profile.phone} onChange={handleChange} />
            </label>
            <label>
              <span>Ciudad</span>
              <input name="city" value={profile.city} onChange={handleChange} />
            </label>
            <div className="cuenta-profile-actions-react">
              <button type="submit" className="cuenta-link-outline">
                Guardar cambios
              </button>
              <button type="button" className="cuenta-logout" onClick={handleLogout}>
                cerrar sesion
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'favoritos' && (
        <div className="cuenta-section">
          <p className="cuenta-empty">todavia no guardaste ninguna pieza.</p>
          <Link href="/" className="cuenta-link-outline">
            ver catalogo
          </Link>
        </div>
      )}

      {tab === 'pedidos' && (
        <div className="cuenta-section">
          {orders.length === 0 ? (
            <>
              <p className="cuenta-empty">todavia no realizaste ningun pedido.</p>
              <Link href="/" className="cuenta-link-outline">
                ver catalogo
              </Link>
            </>
          ) : (
            <div className="cuenta-orders">
              {orders.map((order) => (
                <details key={order.id} className="cuenta-order">
                  <summary className="cuenta-order-summary-react">
                    <span>Pedido #{order.id.slice(-6)}</span>
                    <span>
                      {new Date(order.date).toLocaleDateString('es-AR')} ·{' '}
                      {formatMoney(order.total, currency, usdRate)}
                    </span>
                  </summary>
                  <div className="cuenta-order-progress-react">
                    <span className="is-active">pedido recibido</span>
                    <span className="is-done">paquete armado</span>
                    <span>en camino</span>
                    <span>entregado</span>
                  </div>
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${item.id}-${index}`} className="cuenta-order-item">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatMoney(item.priceArs * item.quantity, currency, usdRate)}</span>
                    </div>
                  ))}
                </details>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
