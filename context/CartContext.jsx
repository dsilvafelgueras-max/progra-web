'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { products } from '../data/catalog';
import { fetchUsdRate } from '../lib/currency';

const CartContext = createContext(null);

function readStoredValue(key, fallback, parseAsJson = false) {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    return parseAsJson ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readStoredValue('sangria-next-cart', [], true));
  const [cartOpen, setCartOpen] = useState(false);
  const [currency, setCurrency] = useState(() => readStoredValue('sangria-next-currency', 'ARS'));
  const [usdRate, setUsdRate] = useState(1400);

  useEffect(() => {
    window.localStorage.setItem('sangria-next-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem('sangria-next-currency', currency);
  }, [currency]);

  useEffect(() => {
    async function loadRate() {
      try {
        const rate = await fetchUsdRate();
        setUsdRate(rate);
      } catch {}
    }
    loadRate();
  }, []);

  const cartItems = cart
    .map((entry) => {
      const product = products.find((p) => p.id === entry.id);
      return product ? { ...product, quantity: entry.quantity } : null;
    })
    .filter(Boolean);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  function addToCart(productId, quantity = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) {
        return current.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { id: productId, quantity }];
    });
    setCartOpen(true);
  }

  function removeFromCart(productId) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);
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
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
