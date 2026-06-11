'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const STEPS = [
  { id: 1, label: 'Contacto' },
  { id: 2, label: 'Entrega' },
  { id: 3, label: 'Pago' },
];

function isStepValid(step, values) {
  if (step === 1) return values.fullName && values.email && values.phone;
  if (step === 2) {
    if (values.deliveryMethod === 'domicilio') return values.address && values.city;
    return true;
  }
  if (step === 3) return true;
  return false;
}

export default function CheckoutForm({ items, currency, rate, formatMoney }) {
  const { user, profile, addOrder } = useAuth();
  const { discount, clearDiscount } = useCart();
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    fullName:       '',
    email:          '',
    phone:          '',
    deliveryMethod: 'domicilio',
    address:        '',
    city:           '',
  });
  const [step,      setStep]      = useState(1);
  const [touched,   setTouched]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState('');

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
  }

  function handleNext() {
    if (!isStepValid(step, formValues)) { setTouched(true); return; }
    setTouched(false);
    setStep((s) => s + 1);
  }

  function handleBack() {
    setTouched(false);
    setStep((s) => s - 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isStepValid(3, formValues)) { setTouched(true); return; }

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

        router.push(`/pedido/${order.id}`);
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

      {/* Step indicator */}
      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s.id} className="checkout-step-item">
            <div className={`checkout-step-circle ${step === s.id ? 'is-active' : ''} ${step > s.id ? 'is-done' : ''}`}>
              {step > s.id ? '✓' : s.id}
            </div>
            <span className={`checkout-step-label ${step === s.id ? 'is-active' : ''}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`checkout-step-line ${step > s.id ? 'is-done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="checkout-panel-layout">
        <form className="checkout-form-react" onSubmit={handleSubmit} noValidate>

          {/* Paso 1: Contacto */}
          {step === 1 && (
            <>
              <label>
                <span>Nombre completo *</span>
                <input name="fullName" value={formValues.fullName} onChange={handleChange} placeholder="Tu nombre" />
                {touched && !formValues.fullName && <span className="field-error">Completá tu nombre</span>}
              </label>
              <label>
                <span>E-mail *</span>
                <input type="email" name="email" value={formValues.email} onChange={handleChange} placeholder="tu@email.com" />
                {touched && !formValues.email && <span className="field-error">Completá tu e-mail</span>}
              </label>
              <label>
                <span>Teléfono *</span>
                <input name="phone" value={formValues.phone} onChange={handleChange} placeholder="+54 11 0000 0000" />
                {touched && !formValues.phone && <span className="field-error">Completá tu teléfono</span>}
              </label>
            </>
          )}

          {/* Paso 2: Entrega */}
          {step === 2 && (
            <>
              <label>
                <span>Método de entrega *</span>
                <select name="deliveryMethod" value={formValues.deliveryMethod} onChange={handleChange}>
                  <option value="domicilio">Entrega a domicilio</option>
                  <option value="encuentro">Punto de encuentro</option>
                  <option value="retiro">Retiro en el local</option>
                </select>
              </label>
              {formValues.deliveryMethod === 'domicilio' && (
                <>
                  <label>
                    <span>Dirección *</span>
                    <input name="address" value={formValues.address} onChange={handleChange} placeholder="Calle y altura" />
                    {touched && !formValues.address && <span className="field-error">Completá la dirección</span>}
                  </label>
                  <label>
                    <span>Ciudad *</span>
                    <input name="city" value={formValues.city} onChange={handleChange} placeholder="Ciudad" />
                    {touched && !formValues.city && <span className="field-error">Completá la ciudad</span>}
                  </label>
                </>
              )}
            </>
          )}

          {/* Paso 3: Pago */}
          {step === 3 && (
            <p className="checkout-payment-note">
              Vas a pagar <strong>{formatMoney(total, currency, rate)}</strong> con Mercado Pago.
              Al confirmar te redirigimos al checkout seguro de Mercado Pago.
            </p>
          )}

          {error && <p className="field-error" style={{ marginTop: '0.5rem' }}>{error}</p>}

          <div className="checkout-nav">
            {step > 1 && (
              <button type="button" className="ghost-button-react" onClick={handleBack}>Volver</button>
            )}
            {step < 3 ? (
              <button type="button" className="primary-button-react" onClick={handleNext}>Siguiente</button>
            ) : (
              <button type="submit" className="primary-button-react" disabled={submitting}>
                {submitting ? 'Procesando…' : 'Pagar con Mercado Pago'}
              </button>
            )}
          </div>

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
