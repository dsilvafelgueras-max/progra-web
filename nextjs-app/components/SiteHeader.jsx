'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function SiteHeader() {
  const { currency, setCurrency, cartCount, setCartOpen } = useCart();

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Next.js · App Router</p>
        <Link href="/" className="header-brand">
          SANGRIA
        </Link>
      </div>

      <nav className="header-nav">
        <Link href="/anillos">Anillos</Link>
        <Link href="/pulseras">Pulseras</Link>
        <Link href="/aros">Aros</Link>
        <Link href="/collares">Collares</Link>
        <Link href="/earcuff">Earcuff</Link>
      </nav>

      <div className="header-tools">
        <div className="currency-switcher" role="group" aria-label="Moneda">
          <button
            type="button"
            className={currency === 'ARS' ? 'is-active' : ''}
            onClick={() => setCurrency('ARS')}
          >
            ARS
          </button>
          <button
            type="button"
            className={currency === 'USD' ? 'is-active' : ''}
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
        </div>

        <button type="button" className="cart-chip" onClick={() => setCartOpen(true)}>
          Carrito
          <strong>{cartCount}</strong>
        </button>
      </div>
    </header>
  );
}
