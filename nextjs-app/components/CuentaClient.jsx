'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { products as catalog } from '../data/catalog';

const STATUS_LABEL = {
  pending:   'pendiente',
  shipped:   'enviado',
  delivered: 'entregado',
  cancelled: 'cancelado',
};

const DELIVERY_LABEL = {
  domicilio: 'Envío a domicilio',
  encuentro: 'Punto de encuentro',
  retiro:    'Retiro en el local',
};

export default function CuentaClient() {
  const { user, profile, logout, orders, updateProfile } = useAuth();
  const { currency, usdRate } = useCart();
  const { favorites, toggle } = useFavorites();
  const favProducts = catalog.filter((p) => favorites.includes(p.id));
  const router = useRouter();

  const [tab,   setTab]   = useState('perfil');
  const [ready, setReady] = useState(false);

  const [form,    setForm]    = useState({ fullName: '', phone: '', address: '', city: '' });
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (ready && !user) router.push('/login');
  }, [ready, user, router]);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? '',
        phone:    profile.phone    ?? '',
        address:  profile.address  ?? '',
        city:     profile.city     ?? '',
      });
    }
  }, [profile]);

  if (!ready || !user) return null;

  function handleLogout() {
    logout();
    router.push('/');
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await updateProfile(form);
      setSaveMsg('Cambios guardados.');
    } catch {
      setSaveMsg('Hubo un error. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="react-content cuenta-page">

      {/* ── Header ── */}
      <div className="cuenta-header">
        <h1 className="cuenta-title">Mi cuenta</h1>
        <p className="cuenta-user-email">{user.email}</p>
      </div>

      {/* ── Tabs ── */}
      <nav className="cuenta-tabs" aria-label="Secciones de cuenta">
        {[
          { id: 'perfil',    label: 'perfil' },
          {
            id: 'favoritos',
            label: (
              <span className="cuenta-tab-fav">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="cuenta-tab-heart">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                favoritos
              </span>
            ),
          },
          { id: 'pedidos',   label: 'pedidos' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'is-active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── Perfil ── */}
      {tab === 'perfil' && (
        <div className="cuenta-section">
          <form className="cuenta-profile-form" onSubmit={handleSave} noValidate>

            {/* Grid de 2 columnas */}
            <div className="cuenta-profile-grid">

              {/* Fila 1 */}
              <label className="cuenta-profile-label">
                <span>Nombre</span>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </label>

              <label className="cuenta-profile-label">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  autoComplete="email"
                />
              </label>

              {/* Fila 2 */}
              <label className="cuenta-profile-label">
                <span>Teléfono</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+54 11 0000 0000"
                  autoComplete="tel"
                />
              </label>

              <label className="cuenta-profile-label">
                <span>Ciudad</span>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Ciudad"
                  autoComplete="address-level2"
                />
              </label>

            </div>

            {/* Dirección — full width */}
            <label className="cuenta-profile-label">
              <span>Dirección</span>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Calle y altura"
                autoComplete="street-address"
              />
            </label>

            {/* Acciones */}
            <div className="cuenta-profile-actions">
              <button type="submit" className="cuenta-save-btn" disabled={saving}>
                {saving ? 'guardando…' : 'guardar cambios'}
              </button>
              {saveMsg && (
                <p className={`cuenta-save-msg${saveMsg.includes('error') || saveMsg.includes('Error') ? ' is-error' : ''}`}>
                  {saveMsg}
                </p>
              )}
            </div>

          </form>

          {/* Divisoria + Cerrar sesión */}
          <div className="cuenta-logout-wrap">
            <button type="button" className="cuenta-logout" onClick={handleLogout}>
              cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* ── Favoritos ── */}
      {tab === 'favoritos' && (
        <div className="cuenta-section">
          {favProducts.length === 0 ? (
            <>
              <p className="cuenta-empty">todavía no guardaste ninguna pieza como favorita.</p>
              <Link href="/productos" className="cuenta-link-outline">ver piezas</Link>
            </>
          ) : (
            <div className="cuenta-favorites">
              {favProducts.map((p) => (
                <div key={p.id} className="cuenta-fav-item">
                  <Link href={`/producto/${p.id}`} className="cuenta-fav-link">
                    <img src={p.image} alt={p.name} className="cuenta-fav-img" />
                    <div className="cuenta-fav-info">
                      <p className="cuenta-fav-category">{p.category}</p>
                      <h4 className="cuenta-fav-name">{p.name}</h4>
                      <span className="cuenta-fav-price">
                        {formatMoney(p.priceArs, currency, usdRate)}
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="cuenta-fav-remove"
                    aria-label="Quitar de favoritos"
                    onClick={() => toggle(p.id)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pedidos ── */}
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

                  <div className="cuenta-order-header">
                    <p className="cuenta-order-date">
                      {new Date(order.created_at).toLocaleDateString('es-AR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                    <span className={`cuenta-order-badge is-${order.status}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>

                  {order.items?.map((item, i) => (
                    <div key={i} className="cuenta-order-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatMoney(item.priceArs * item.quantity, currency, usdRate)}</span>
                    </div>
                  ))}

                  {order.delivery_method && (
                    <p className="cuenta-order-delivery">
                      {DELIVERY_LABEL[order.delivery_method] ?? order.delivery_method}
                      {order.delivery_method === 'domicilio' && order.city ? ` — ${order.city}` : ''}
                    </p>
                  )}

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

    </main>
  );
}
