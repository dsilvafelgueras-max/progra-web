'use client';
import { useState } from 'react';

export default function NewsletterSection() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Ocurrió un error.');
        return;
      }

      setStatus('success');
      setMessage(data.already ? 'Ya estabas suscripta.' : '¡Gracias! Te agregamos a la lista.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Ocurrió un error. Intentá de nuevo.');
    }
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <p className="newsletter-eyebrow">newsletter</p>
          <h2 className="newsletter-title">Suscribite</h2>
          <p className="newsletter-subtitle">
            Novedades, lanzamientos y piezas exclusivas antes que nadie.
          </p>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
          {status === 'success' ? (
            <p className="newsletter-success">{message}</p>
          ) : (
            <>
              <div className="newsletter-field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={status === 'loading'}
                  aria-label="Tu email"
                />
                <button type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? '...' : 'Suscribirme'}
                </button>
              </div>
              {status === 'error' && (
                <p className="newsletter-error">{message}</p>
              )}
            </>
          )}
        </form>
      </div>
    </section>
  );
}
