'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function getInitials(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).map((n) => n[0].toUpperCase()).slice(0, 2).join('');
}

export default function SiteHeader() {
  const { currency, setCurrency, cartCount, setCartOpen } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className={`app-header${isHome ? ' header-home' : ''}`}>
      <div>
        {!isHome && <p className="eyebrow">Next.js · App Router</p>}
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

        {user ? (
          <Link href="/cuenta" className="header-user">
            {getInitials(user.name)}
          </Link>
        ) : (
          <Link href="/login" className="header-login">
            ingresar
          </Link>
        )}

        <button type="button" className="cart-chip" onClick={() => setCartOpen(true)}>
          Carrito
          <strong>{cartCount}</strong>
        </button>
      </div>
    </header>
  );
}
