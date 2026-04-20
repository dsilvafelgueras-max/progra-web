'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/catalog';
import { fetchUsdRate } from '../lib/currency';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currency, setCurrency] = useState('ARS');
  const [usdRate, setUsdRate] = useState(1400);

  useEffect(() => {
    const savedCart = localStorage.getItem('sangria-next-cart');
    const savedCurrency = localStorage.getItem('sangria-next-currency');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  useEffect(() => {
    localStorage.setItem('sangria-next-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sangria-next-currency', currency);
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

  function addToCart(productId) {
    setCart((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) {
        return current.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { id: productId, quantity: 1 }];
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
