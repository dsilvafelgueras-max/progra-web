'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/catalog';
import { fetchUsdRate } from '../lib/currency';
import { useAuth } from './AuthContext';

const CART_KEY = 'sangria-next-cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart]         = useState([]);   // [{ id, quantity }]
  const [cartOpen, setCartOpen] = useState(false);
  const [currency, setCurrency] = useState('ARS');
  const [usdRate, setUsdRate]   = useState(1400);
  const [initialized, setInitialized] = useState(false);

  const { user, loading } = useAuth();

  // ── Carga el carrito cuando se resuelve la sesión ──────────────────────────
  useEffect(() => {
    if (loading) return;

    setInitialized(false);

    async function loadCart() {
      const token = localStorage.getItem('sangria-token');

      if (user && token) {
        // Usuario logueado: carga desde Supabase
        try {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const items = await res.json();
            setCart(items.map((item) => ({
              id:       item.product_id,
              quantity: item.quantity,
            })));
          }
        } catch {
          // Fallback: leer localStorage si Supabase falla
          const saved = localStorage.getItem(CART_KEY);
          if (saved) setCart(JSON.parse(saved));
        }
      } else {
        // Invitado: leer localStorage
        const saved = localStorage.getItem(CART_KEY);
        setCart(saved ? JSON.parse(saved) : []);
      }

      setInitialized(true);
    }

    loadCart();

    const savedCurrency = localStorage.getItem('sangria-next-currency');
    if (savedCurrency) setCurrency(savedCurrency);
  }, [user, loading]);

  // ── Guarda moneda ──────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('sangria-next-currency', currency);
  }, [currency]);

  // ── Tasa USD ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsdRate().then(setUsdRate).catch(() => {});
  }, []);

  // ── Helper: guardar en localStorage (solo invitados) ───────────────────────
  // Se llama DIRECTAMENTE en add/remove para evitar race conditions con
  // el flag `initialized`. No usa useEffect para el guardado.
  function saveLocalCart(newCart) {
    if (!user) {
      localStorage.setItem(CART_KEY, JSON.stringify(newCart));
    }
  }

  // ── Derivados ──────────────────────────────────────────────────────────────
  const cartItems = cart
    .map((entry) => {
      const product = products.find((p) => p.id === entry.id);
      return product ? { ...product, quantity: entry.quantity } : null;
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // ── Agregar al carrito ─────────────────────────────────────────────────────
  async function addToCart(productId) {
    // 1. Calcular el nuevo carrito
    const existing = cart.find((item) => item.id === productId);
    const newCart = existing
      ? cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { id: productId, quantity: 1 }];

    // 2. Actualizar estado local y guardar en localStorage (inmediato)
    setCart(newCart);
    saveLocalCart(newCart);

    // 3. Abrir el carrito
    setCartOpen(true);

    // 4. Persistir en Supabase si hay sesión (no bloquea el UI)
    const token = localStorage.getItem('sangria-token');
    if (user && token) {
      const newQty = (existing?.quantity ?? 0) + 1;
      try {
        await fetch(`/api/cart/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        });
      } catch { /* optimistic update ya aplicado */ }
    }
  }

  // ── Quitar del carrito ─────────────────────────────────────────────────────
  async function removeFromCart(productId) {
    const existing = cart.find((item) => item.id === productId);
    if (!existing) return;

    const newQty = existing.quantity - 1;
    const newCart = newQty <= 0
      ? cart.filter((item) => item.id !== productId)
      : cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQty } : item
        );

    // 1. Actualizar estado local y guardar en localStorage (inmediato)
    setCart(newCart);
    saveLocalCart(newCart);

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
        initialized,
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
