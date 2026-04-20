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

export default function CheckoutForm({ items, currency, rate, formatMoney }) {
  const [formValues, setFormValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.priceArs * item.quantity, 0),
    [items]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="checkout-panel-react" style={{ maxWidth: '100%' }}>
      <div className="checkout-panel-head">
        <div>
          <p className="eyebrow">Formulario controlado</p>
          <h2>Checkout</h2>
        </div>
      </div>

      <div className="checkout-panel-layout">
        <form className="checkout-form-react" onSubmit={handleSubmit}>
          <label>
            <span>Nombre completo *</span>
            <input
              name="fullName"
              value={formValues.fullName}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </label>
          <label>
            <span>E-mail *</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </label>
          <label>
            <span>Telefono *</span>
            <input
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              placeholder="+54 11 0000 0000"
              required
            />
          </label>
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
                  required
                />
              </label>
              <label>
                <span>Ciudad *</span>
                <input
                  name="city"
                  value={formValues.city}
                  onChange={handleChange}
                  placeholder="Ciudad"
                  required
                />
              </label>
            </>
          )}

          <label>
            <span>Titular de tarjeta *</span>
            <input
              name="cardName"
              value={formValues.cardName}
              onChange={handleChange}
              placeholder="Como figura en la tarjeta"
              required
            />
          </label>
          <label>
            <span>Numero de tarjeta *</span>
            <input
              name="cardNumber"
              value={formValues.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              required
            />
          </label>

          <button type="submit" className="primary-button-react">
            Confirmar compra
          </button>

          {submitted && (
            <p className="checkout-success-react">
              Pedido confirmado. Gracias por tu compra en SANGRIA.
            </p>
          )}
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
