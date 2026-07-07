'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { validateCheckout } from '../lib/validation';

const PAYMENT_METHODS = [
  {
    id: 'mercado-pago',
    label: 'Mercado Pago',
    note: 'Te redirigimos al checkout seguro de Mercado Pago para completar el pago.',
  },
  {
    id: 'tarjeta',
    label: 'Tarjeta de crédito / débito',
    note: 'Visa, Mastercard, Amex — ingresás los datos en el checkout seguro de Mercado Pago.',
  },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    note: 'CBU / Alias al confirmar',
  },
  {
    id: 'efectivo',
    label: 'Efectivo',
    note: 'Al momento del retiro o encuentro',
  },
];

const REDIRECT_TO_MP = new Set(['mercado-pago', 'tarjeta']);

export default function CheckoutForm({ items, currency, rate, formatMoney }) {
  const { user, profile, addOrder } = useAuth();
  const { discount, clearDiscount, clearCart } = useCart();
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    fullName:       '',
    email:          '',
    phone:          '',
    paymentMethod:  'mercado-pago',
    deliveryMethod: 'domicilio',
    address:        '',
    city:           '',
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  // ── Auto-fill con datos del perfil ───────────────────────────────
  useEffect(() => {
    if (user || profile) {
      setFormValues((prev) => ({
        ...prev,
        fullName: profile?.fullName || user?.name || prev.fullName,
        email:    user?.email       || prev.email,
        phone:    profile?.phone    || prev.phone,
        address:  profile?.address  || prev.address,
        city:     profile?.city     || prev.city,
      }));
    }
  }, [user, profile]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.priceArs * item.quantity, 0),
    [items]
  );
  const discountAmount = discount > 0 ? Math.round(subtotal * discount / 100) : 0;
  const total = subtotal - discountAmount;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
    // Al corregir un campo, limpiar su error para feedback inmediato.
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateCheckout(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    setError('');

    const orderPayload = {
      items: items.map((item) => ({
        id:       item.id,
        name:     item.name,
        priceArs: item.priceArs,
        quantity: item.quantity,
      })),
      total,
      deliveryMethod: formValues.deliveryMethod,
      address:        formValues.address  || null,
      city:           formValues.city     || null,
      fullName:       formValues.fullName,
      email:          formValues.email,
      phone:          formValues.phone,
    };

    try {
      const token = localStorage.getItem('sangria-token');
      let order;

      if (user) {
        order = await addOrder(orderPayload);
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
        if (res.ok) order = await res.json();
      }

      if (order?.id) {
        clearDiscount();
        clearCart();

        if (REDIRECT_TO_MP.has(formValues.paymentMethod)) {
          const paymentRes = await fetch(`/api/orders/${order.id}/payment`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (paymentRes.ok) {
            const { init_point, sandbox_init_point } = await paymentRes.json();
            const redirectUrl = sandbox_init_point || init_point;
            if (redirectUrl) {
              window.location.href = redirectUrl;
              return;
            }
          }
        }

        router.push(`/pedido/${order.id}?payment_method=${formValues.paymentMethod}`);
        return;
      }

      // La API falló sin devolver una orden: pantalla de éxito local
      router.push('/pedido/confirmado');
    } catch {
      setError('Hubo un error al procesar tu pedido. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="checkout-panel-react" style={{ maxWidth: '100%' }}>
      <div className="checkout-panel-head">
        <div>
          <p className="eyebrow">Checkout</p>
          <h2>Tu pedido</h2>
        </div>
      </div>

      <div className="checkout-panel-layout">
        <form className="checkout-form-react checkout-form-single" onSubmit={handleSubmit} noValidate>

          {/* Datos de contacto */}
          <div className="checkout-form-section">
            <h3 className="checkout-section-title">Datos de contacto</h3>
            <label>
              <span>Nombre completo *</span>
              <input name="fullName" value={formValues.fullName} onChange={handleChange} placeholder="Tu nombre" aria-invalid={Boolean(errors.fullName)} />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </label>
            <div className="checkout-form-row">
              <label>
                <span>E-mail *</span>
                <input type="email" name="email" value={formValues.email} onChange={handleChange} placeholder="tu@email.com" aria-invalid={Boolean(errors.email)} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </label>
              <label>
                <span>Teléfono *</span>
                <input name="phone" value={formValues.phone} onChange={handleChange} placeholder="+54 11 0000 0000" aria-invalid={Boolean(errors.phone)} />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </label>
            </div>
          </div>

          <hr className="checkout-divider" />

          {/* Forma de pago */}
          <div className="checkout-form-section">
            <h3 className="checkout-section-title">Forma de pago</h3>
            <div className="checkout-payment-options">
              {PAYMENT_METHODS.map((method) => {
                const checked = formValues.paymentMethod === method.id;
                return (
                  <div key={method.id} className="checkout-payment-item">
                    <label className={`checkout-payment-option ${checked ? 'is-checked' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={checked}
                        onChange={handleChange}
                      />
                      <span className="checkout-payment-option-label">
                        <strong>{method.label}</strong>
                      </span>
                    </label>
                    {checked && method.id === 'transferencia' && (
                      <div className="checkout-payment-panel">
                        <div className="checkout-bank-info">
                          <p><span>Banco</span><strong>Banco Galicia</strong></p>
                          <p><span>Titular</span><strong>SANGRIA</strong></p>
                          <p><span>CBU</span><strong>0070999920000000000000</strong></p>
                          <p><span>Alias</span><strong>SANGRIA.JOYAS</strong></p>
                        </div>
                        <p className="checkout-bank-note">Una vez realizada la transferencia, envianos el comprobante por Instagram o por correo.</p>
                      </div>
                    )}
                    {checked && method.id !== 'transferencia' && (
                      <div className="checkout-payment-panel">
                        <p className="checkout-bank-note">{method.note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="checkout-divider" />

          {/* Envío */}
          <div className="checkout-form-section">
            <h3 className="checkout-section-title">Envío</h3>
            <label>
              <span>Método de entrega *</span>
              <select name="deliveryMethod" value={formValues.deliveryMethod} onChange={handleChange}>
                <option value="domicilio">Entrega a domicilio</option>
                <option value="encuentro">Punto de encuentro</option>
                <option value="retiro">Retiro en el local</option>
              </select>
            </label>
            {formValues.deliveryMethod === 'domicilio' && (
              <div className="checkout-form-row">
                <label>
                  <span>Dirección *</span>
                  <input name="address" value={formValues.address} onChange={handleChange} placeholder="Calle y altura" aria-invalid={Boolean(errors.address)} />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </label>
                <label>
                  <span>Ciudad *</span>
                  <input name="city" value={formValues.city} onChange={handleChange} placeholder="Ciudad" aria-invalid={Boolean(errors.city)} />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </label>
              </div>
            )}
          </div>

          {error && <p className="field-error" style={{ marginTop: '0.5rem' }}>{error}</p>}

          <button type="submit" className="primary-button-react checkout-submit-button" disabled={submitting}>
            {submitting ? 'Procesando…' : 'Finalizar compra'}
          </button>

        </form>

        <aside className="checkout-summary-react">
          <h3>Resumen</h3>
          {items.map((item) => (
            <div key={item.id} className="checkout-summary-row">
              <span>{item.name} x {item.quantity}</span>
              <strong>{formatMoney(item.priceArs * item.quantity, currency, rate)}</strong>
            </div>
          ))}
          {discount > 0 && (
            <>
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <strong>{formatMoney(subtotal, currency, rate)}</strong>
              </div>
              <div className="checkout-summary-row is-discount">
                <span>Descuento {discount}%</span>
                <strong>− {formatMoney(discountAmount, currency, rate)}</strong>
              </div>
            </>
          )}
          <div className="checkout-summary-row is-total">
            <span>Total</span>
            <strong>{formatMoney(total, currency, rate)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
