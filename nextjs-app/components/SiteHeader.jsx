'use client';
import { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className={`app-header${isHome ? ' header-home' : ''}`}>
        <button
          type="button"
          className="header-menu-button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/" className="header-brand">
          SANGRIA
        </Link>

        <div className="header-tools" aria-label="Accesos rapidos">
          <button type="button" className="header-icon-button" aria-label="Buscar">
            <span className="icon-search" />
          </button>

          {user ? (
            <Link href="/cuenta" className="header-icon-button" aria-label="Mi cuenta">
              <span className="header-user-initials">{getInitials(user.name)}</span>
            </Link>
          ) : (
            <Link href="/login" className="header-icon-button" aria-label="Ingresar">
              <span className="icon-user" />
            </Link>
          )}

          <button
            type="button"
            className="header-icon-button header-cart-button"
            onClick={() => setCartOpen(true)}
            aria-label="Abrir carrito"
          >
            <span className="icon-bag" />
            {cartCount > 0 && <strong>{cartCount}</strong>}
          </button>
        </div>
      </header>

      <div className={`side-menu-layer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <button type="button" className="side-menu-backdrop" aria-label="Cerrar menu" onClick={closeMenu} />

        <aside className="side-menu" aria-label="Menu principal">
          <div className="side-menu-top">
            <Link href="/" className="side-menu-brand" onClick={closeMenu}>
              SANGRIA
            </Link>
            <button type="button" className="side-menu-close" aria-label="Cerrar menu" onClick={closeMenu}>
              x
            </button>
          </div>

          <nav className="side-menu-nav">
            <Link href="/anillos" onClick={closeMenu}>Productos</Link>
            <Link href="/guia-talles" onClick={closeMenu}>Guia De Talles</Link>
            <Link href="/tarjeta-regalo" onClick={closeMenu}>Tarjeta Regalo</Link>
            <Link href="/nuestra-historia" onClick={closeMenu}>Conocenos</Link>
          </nav>

          <div className="side-menu-bottom">
            <div className="side-menu-social">
              <a href="https://www.instagram.com/sangria_studio?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer">instagram</a>
              <a href="https://www.tiktok.com/@lolisilvafelgue" target="_blank" rel="noreferrer">tiktok</a>
            </div>

            <div className="side-menu-currency" role="group" aria-label="Moneda">
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
          </div>
        </aside>
      </div>
    </>
  );
}
