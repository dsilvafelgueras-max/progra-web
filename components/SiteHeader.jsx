'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12.5c2.62 0 4.75-2.13 4.75-4.75S14.62 3 12 3 7.25 5.13 7.25 7.75 9.38 12.5 12 12.5Zm0-8c1.79 0 3.25 1.46 3.25 3.25S13.79 11 12 11 8.75 9.54 8.75 7.75 10.21 4.5 12 4.5Zm0 10.25c-4.08 0-7.25 2.09-7.25 4.75a.75.75 0 0 0 1.5 0c0-1.57 2.39-3.25 5.75-3.25s5.75 1.68 5.75 3.25a.75.75 0 0 0 1.5 0c0-2.66-3.17-4.75-7.25-4.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const { currency, setCurrency, cartCount, setCartOpen } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className={`app-header${isHome ? ' header-home' : ''}`}>
      <div>
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
        <Link href="/tarjeta-regalo">Gift cards</Link>
      </nav>

      <div className="header-tools">
        <Link href="/anillos" className="header-login">
          buscar
        </Link>

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

        <Link href={user ? '/cuenta' : '/login'} className="header-user" aria-label="Mi cuenta">
          <UserIcon />
        </Link>

        <button type="button" className="cart-chip" onClick={() => setCartOpen(true)}>
          Carrito
          <strong>{cartCount}</strong>
        </button>
      </div>
    </header>
  );
}
