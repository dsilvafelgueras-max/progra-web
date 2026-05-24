'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/currency';
import { useCart } from '../context/CartContext';

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
  const router = useRouter();

  const [tab,   setTab]   = useState('pedidos');
  const [ready, setReady] = useState(false);

  // ── Formulario de perfil ─────────────────────────────────────────
  const [form,    setForm]    = useState({ fullName: '', phone: '', address: '', city: '' });
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (ready && !user) router.push('/login');
  }, [ready, user, router]);

  // Sincronizar formulario cuando carga el perfil
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

      <div className="cuenta-tabs">
        <button type="button" className={tab === 'pedidos' ? 'is-active' : ''} onClick={() => setTab('pedidos')}>
          pedidos
        </button>
        <button type="button" className={tab === 'perfil' ? 'is-active' : ''} onClick={() => setTab('perfil')}>
          perfil
        </button>
      </div>

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

      {/* ── Perfil ── */}
      {tab === 'perfil' && (
        <div className="cuenta-section">
          <form className="cuenta-profile-form" onSubmit={handleSave} noValidate>

            <label className="cuenta-profile-label">
              <span>nombre completo</span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Tu nombre"
              />
            </label>

            <label className="cuenta-profile-label">
              <span>e-mail</span>
              <input type="email" value={user.email} disabled />
            </label>

            <label className="cuenta-profile-label">
              <span>teléfono</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+54 11 0000 0000"
              />
            </label>

            <label className="cuenta-profile-label">
              <span>dirección</span>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Calle y altura"
              />
            </label>

            <label className="cuenta-profile-label">
              <span>ciudad</span>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ciudad"
              />
            </label>

            <div className="cuenta-profile-actions">
              <button type="submit" className="cuenta-save-btn" disabled={saving}>
                {saving ? 'guardando…' : 'guardar cambios'}
              </button>
              {saveMsg && (
                <p className={`cuenta-save-msg ${saveMsg.includes('error') || saveMsg.includes('Error') ? 'is-error' : ''}`}>
                  {saveMsg}
                </p>
              )}
            </div>

          </form>

          <button type="button" className="cuenta-logout" onClick={handleLogout}>
            cerrar sesión
          </button>
        </div>
      )}

    </main>
  );
}
