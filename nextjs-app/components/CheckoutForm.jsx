'use client';
import { useMemo, useState } from 'react';

const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  deliveryMethod: 'domicilio',
  address: '',
  city: '',
  cardName: '',
  cardNumber: '',
};

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
  if (step === 3) return values.cardName && values.cardNumber;
  return false;
}

export default function CheckoutForm({ items, currency, rate, formatMoney }) {
  const [formValues, setFormValues] = useState(initialValues);
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.priceArs * item.quantity, 0),
    [items]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleNext() {
    if (!isStepValid(step, formValues)) {
      setTouched(true);
      return;
    }
    setTouched(false);
    setStep((s) => s + 1);
  }

  function handleBack() {
    setTouched(false);
    setStep((s) => s - 1);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isStepValid(3, formValues)) {
      setTouched(true);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="checkout-panel-react" style={{ maxWidth: '100%' }}>
        <div className="checkout-success-screen">
          <p className="eyebrow">Listo</p>
          <h2>Pedido confirmado</h2>
          <p>Gracias por tu compra, {formValues.fullName}. Te contactamos a {formValues.email}.</p>
        </div>
      </section>
    );
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
            <span className={`checkout-step-label ${step === s.id ? 'is-active' : ''}`}>
              {s.label}
            </span>
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
                <input
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
                {touched && !formValues.fullName && (
                  <span className="field-error">Completá tu nombre</span>
                )}
              </label>
              <label>
                <span>E-mail *</span>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
                {touched && !formValues.email && (
                  <span className="field-error">Completá tu e-mail</span>
                )}
              </label>
              <label>
                <span>Telefono *</span>
                <input
                  name="phone"
                  value={formValues.phone}
                  onChange={handleChange}
                  placeholder="+54 11 0000 0000"
                />
                {touched && !formValues.phone && (
                  <span className="field-error">Completá tu teléfono</span>
                )}
              </label>
            </>
          )}

          {/* Paso 2: Entrega */}
          {step === 2 && (
            <>
              <label>
                <span>Metodo de entrega *</span>
                <select
                  name="deliveryMethod"
                  value={formValues.deliveryMethod}
                  onChange={handleChange}
                >
                  <option value="domicilio">Entrega a domicilio</option>
                  <option value="encuentro">Punto de encuentro</option>
                  <option value="retiro">Retiro en el local</option>
                </select>
              </label>
              {formValues.deliveryMethod === 'domicilio' && (
                <>
                  <label>
                    <span>Direccion *</span>
                    <input
                      name="address"
                      value={formValues.address}
                      onChange={handleChange}
                      placeholder="Calle y altura"
                    />
                    {touched && !formValues.address && (
                      <span className="field-error">Completá la dirección</span>
                    )}
                  </label>
                  <label>
                    <span>Ciudad *</span>
                    <input
                      name="city"
                      value={formValues.city}
                      onChange={handleChange}
                      placeholder="Ciudad"
                    />
                    {touched && !formValues.city && (
                      <span className="field-error">Completá la ciudad</span>
                    )}
                  </label>
                </>
              )}
            </>
          )}

          {/* Paso 3: Pago */}
          {step === 3 && (
            <>
              <label>
                <span>Titular de tarjeta *</span>
                <input
                  name="cardName"
                  value={formValues.cardName}
                  onChange={handleChange}
                  placeholder="Como figura en la tarjeta"
                />
                {touched && !formValues.cardName && (
                  <span className="field-error">Completá el titular</span>
                )}
              </label>
              <label>
                <span>Numero de tarjeta *</span>
                <input
                  name="cardNumber"
                  value={formValues.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                />
                {touched && !formValues.cardNumber && (
                  <span className="field-error">Completá el número de tarjeta</span>
                )}
              </label>
            </>
          )}

          {/* Navegación */}
          <div className="checkout-nav">
            {step > 1 && (
              <button type="button" className="ghost-button-react" onClick={handleBack}>
                Volver
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="primary-button-react" onClick={handleNext}>
                Siguiente
              </button>
            ) : (
              <button type="submit" className="primary-button-react">
                Confirmar compra
              </button>
            )}
          </div>
        </form>

        <aside className="checkout-summary-react">
          <h3>Resumen</h3>
          {items.map((item) => (
            <div key={item.id} className="checkout-summary-row">
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatMoney(item.priceArs * item.quantity, currency, rate)}</strong>
            </div>
          ))}
          <div className="checkout-summary-row is-total">
            <span>Total</span>
            <strong>{formatMoney(subtotal, currency, rate)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
