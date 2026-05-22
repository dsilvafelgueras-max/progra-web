'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/catalog';
import { fetchUsdRate } from '../lib/currency';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart]           = useState([]);  // [{ id, quantity }]
  const [cartOpen, setCartOpen]   = useState(false);
  const [currency, setCurrency]   = useState('ARS');
  const [usdRate, setUsdRate]     = useState(1400);
  const [initialized, setInitialized] = useState(false);

  const { user, loading } = useAuth();

  // ── Carga el carrito según si el usuario está logueado o no ──────
  useEffect(() => {
    if (loading) return; // esperar a que AuthContext resuelva la sesión

    setInitialized(false);

    async function loadCart() {
      const token = localStorage.getItem('sangria-token');

      if (user && token) {
        // Usuario logueado → cargar desde Supabase
        try {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const items = await res.json();
            setCart(items.map((item) => ({
              id: item.product_id,
              quantity: item.quantity,
            })));
          }
        } catch {}
      } else {
        // Invitado → cargar desde localStorage
        const saved = localStorage.getItem('sangria-next-cart');
        setCart(saved ? JSON.parse(saved) : []);
      }

      setInitialized(true);
    }

    loadCart();

    const savedCurrency = localStorage.getItem('sangria-next-currency');
    if (savedCurrency) setCurrency(savedCurrency);
  }, [user, loading]);

  // ── Guarda en localStorage SOLO para invitados y después de inicializar ──
  useEffect(() => {
    if (!initialized || user) return;
    localStorage.setItem('sangria-next-cart', JSON.stringify(cart));
  }, [cart, initialized, user]);

  useEffect(() => {
    localStorage.setItem('sangria-next-currency', currency);
  }, [currency]);

  // ── Tasa USD ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsdRate().then(setUsdRate).catch(() => {});
  }, []);

  // ── Derivados ─────────────────────────────────────────────────────────────
  const cartItems = cart
    .map((entry) => {
      const product = products.find((p) => p.id === entry.id);
      return product ? { ...product, quantity: entry.quantity } : null;
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // ── Agregar al carrito ────────────────────────────────────────────────────
  async function addToCart(productId) {
    const token = localStorage.getItem('sangria-token');

    if (user && token) {
      const existing = cart.find((item) => item.id === productId);
      const newQty   = (existing?.quantity ?? 0) + 1;

      const res = await fetch(`/api/cart/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        setCart((current) => {
          const exists = current.find((item) => item.id === productId);
          if (exists) {
            return current.map((item) =>
              item.id === productId ? { ...item, quantity: newQty } : item
            );
          }
          return [...current, { id: productId, quantity: newQty }];
        });
      }
    } else {
      // Invitado
      setCart((current) => {
        const existing = current.find((item) => item.id === productId);
        if (existing) {
          return current.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...current, { id: productId, quantity: 1 }];
      });
    }

    setCartOpen(true);
  }

  // ── Quitar del carrito ────────────────────────────────────────────────────
  async function removeFromCart(productId) {
    const token    = localStorage.getItem('sangria-token');
    const existing = cart.find((item) => item.id === productId);
    if (!existing) return;

    const newQty = existing.quantity - 1;

    if (user && token) {
      if (newQty <= 0) {
        await fetch(`/api/cart/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart((current) => current.filter((item) => item.id !== productId));
      } else {
        const res = await fetch(`/api/cart/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        });
        if (res.ok) {
          setCart((current) =>
            current.map((item) =>
              item.id === productId ? { ...item, quantity: newQty } : item
            )
          );
        }
      }
    } else {
      // Invitado
      setCart((current) =>
        current
          .map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0)
      );
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        cartOpen,
        setCartOpen,
        currency,
        setCurrency,
        usdRate,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
