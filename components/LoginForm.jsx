'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const { login, register } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect') || '/cuenta';

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [values, setValues]   = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(values.email, values.password);
        router.push(redirectTo);       // vuelve a la página que pidió login
      } else {
        const data = await register(values.email, values.password, values.name);
        if (!data.session) {
          // Muy raro ahora que usamos admin.createUser — por si acaso
          setError('Cuenta creada. Ya podés ingresar con tu email y contraseña.');
          setMode('login');
          setLoading(false);
          return;
        }
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err.message ?? 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <span className="login-brand">SANGRIA</span>

        <div className="login-copy">
          <p className="eyebrow">Cuenta</p>
          <h1>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
          <p>Ingresá con tu correo para guardar favoritos y ver tus compras.</p>
        </div>

        <form className="checkout-form-react login-form" onSubmit={handleSubmit} noValidate>

          {mode === 'register' && (
            <label>
              <span>Nombre *</span>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </label>
          )}

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
              minLength={6}
            />
          </label>

          {error && (
            <p className="field-error" style={{ borderRadius: 0 }}>{error}</p>
          )}

          <button type="submit" className="primary-button-react" disabled={loading}>
            {loading
              ? 'Un momento...'
              : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <p className="login-toggle">
          <span>{mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}</span>{' '}
          <button
            type="button"
            className="text-button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Crear cuenta' : 'Ingresá'}
          </button>
        </p>

        <p className="login-note">Al continuar aceptás nuestros Términos del servicio.</p>
      </section>

      <div className="login-image-panel">
        <img src="/mujer.jpg" alt="SANGRIA" />
      </div>
    </main>
  );
}
