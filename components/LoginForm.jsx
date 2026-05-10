'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState({ nombre: '', email: '', password: '' });

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    login({ name: values.nombre, email: values.email });
    router.push('/');
  }

  return (
    <main className="react-content">
      <section className="login-panel">
        <p className="eyebrow">Cuenta</p>
        <h1>Ingresar</h1>
        <form className="checkout-form-react login-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre *</span>
            <input
              type="text"
              name="nombre"
              value={values.nombre}
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
      </section>
    </main>
  );
}
