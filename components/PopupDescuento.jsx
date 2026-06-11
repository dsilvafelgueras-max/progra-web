'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const POPUP_KEY = 'sangria-popup-seen';

export default function PopupDescuento() {
  const { user, register } = useAuth();
  const { setDiscount } = useCart();

  const [visible,  setVisible]  = useState(false);
  const [values,   setValues]   = useState({ email: '', password: '' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  useEffect(() => {
    if (user) return;
    if (localStorage.getItem(POPUP_KEY)) return;
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, [user]);

  function dismiss() {
    localStorage.setItem(POPUP_KEY, '1');
    setVisible(false);
  }

  function applyDiscount() {
    localStorage.setItem('sangria-descuento', '10');
    setDiscount(10);
    localStorage.setItem(POPUP_KEY, '1');
    setSuccess(true);
    setTimeout(() => setVisible(false), 2500);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(values.email, values.password, values.email.split('@')[0]);
      applyDiscount();
    } catch (err) {
      const msg = err.message ?? '';
      // Si el mail ya existe igual aplicamos el descuento
      if (msg.includes('Ya existe') || msg.includes('already')) {
        applyDiscount();
      } else {
        setError(msg || 'Ocurrió un error. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div className="popup-box" role="dialog" aria-modal="true" aria-label="Oferta de bienvenida">

        <button className="popup-close" onClick={dismiss} aria-label="Cerrar">×</button>

        {success ? (
          <div className="popup-success-state">
            <p className="popup-success-title">¡Listo!</p>
            <p className="popup-success-text">
              Tu descuento del <strong>10%</strong> está aplicado en tu primera compra.
            </p>
          </div>
        ) : (
          <>
            <p className="popup-eyebrow">oferta de bienvenida</p>
            <h2 className="popup-title">10% en tu<br />primera compra</h2>
            <p className="popup-subtitle">
              Registrate con tu mail y contraseña para recibir el descuento automáticamente.
            </p>

            <form className="popup-form checkout-form-react" onSubmit={handleSubmit} noValidate>
              <label>
                <span>E-mail</span>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                <span>Contraseña</span>
                <input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              {error && <p className="field-error" style={{ borderRadius: 0 }}>{error}</p>}

              <button type="submit" className="primary-button-react" disabled={loading}>
                {loading ? 'Un momento...' : 'Obtener descuento'}
              </button>
            </form>

            <button type="button" className="popup-skip" onClick={dismiss}>
              No, gracias
            </button>
          </>
        )}

      </div>
    </div>
  );
}
