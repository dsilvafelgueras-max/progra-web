'use client';
import { useState } from 'react';

export default function LoginForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="react-content">
      <section className="login-panel">
        <p className="eyebrow">Cuenta</p>
        <h1>Ingresar</h1>

        {submitted ? (
          <p className="checkout-success-react">
            Sesion iniciada. Este formulario demuestra estado controlado en Next.js.
          </p>
        ) : (
          <form className="checkout-form-react login-form" onSubmit={handleSubmit}>
            <label>
              <span>E-mail *</span>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </label>
            <label>
              <span>Contraseña *</span>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </label>
            <button type="submit" className="primary-button-react">
              Ingresar
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
