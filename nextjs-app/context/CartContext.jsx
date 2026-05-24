'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/catalog';
import { fetchUsdRate } from '../lib/currency';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart]               = useState([]);  // [{ id, quantity }]
  const [cartOpen, setCartOpen]       = useState(false);
  const [currency, setCurrency]       = useState('ARS');
  const [usdRate, setUsdRate]         = useState(1400);
  const [initialized, setInitialized] = useState(false);

  const { user, loading } = useAuth();

  // ── Carga el carrito cuando se resuelve la sesión ────────────────────────
  useEffect(() => {
    if (loading) return;

    setInitialized(false);

    async function loadCart() {
      const token = localStorage.getItem('sangria-token');

      if (user && token) {
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
        } catch { /* usa carrito local como fallback */ }
      } else {
        const saved = localStorage.getItem('sangria-next-cart');
        setCart(saved ? JSON.parse(saved) : []);
      }

      setInitialized(true);
    }

    loadCart();

    const savedCurrency = localStorage.getItem('sangria-next-currency');
    if (savedCurrency) setCurrency(savedCurrency);
  }, [user, loading]);

  // ── Guarda en localStorage solo para invitados ───────────────────────────
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

  // ── Agregar al carrito (optimistic update) ───────────────────────────────
  // El estado local se actualiza YA — sin importar si hay sesión o API.
  // La persistencia en Supabase ocurre después, en background.
  async function addToCart(productId) {
    // 1. Actualizar estado local inmediatamente
    setCart((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) {
        return current.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { id: productId, quantity: 1 }];
    });

    // 2. Abrir el carrito YA
    setCartOpen(true);

    // 3. Persistir en Supabase si hay sesión (no bloquea el UI)
    const token = localStorage.getItem('sangria-token');
    if (user && token) {
      try {
        const existing = cart.find((item) => item.id === productId);
        const newQty   = (existing?.quantity ?? 0) + 1;
        await fetch(`/api/cart/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        });
      } catch { /* optimistic update ya aplicado, silenciar error */ }
    }
  }

  // ── Quitar del carrito (optimistic update) ───────────────────────────────
  async function removeFromCart(productId) {
    const existing = cart.find((item) => item.id === productId);
    if (!existing) return;

    const newQty = existing.quantity - 1;

    // 1. Actualizar estado local inmediatamente
    if (newQty <= 0) {
      setCart((current) => current.filter((item) => item.id !== productId));
    } else {
      setCart((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, quantity: newQty } : item
        )
      );
    }

    // 2. Persistir en Supabase si hay sesión
    const token = localStorage.getItem('sangria-token');
    if (user && token) {
      try {
        if (newQty <= 0) {
          await fetch(`/api/cart/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await fetch(`/api/cart/${productId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQty }),
          });
        }
      } catch { /* optimistic update ya aplicado */ }
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
