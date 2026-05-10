'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

function readStoredJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredJson('sangria-user', null));
  const [orders, setOrders] = useState(() => readStoredJson('sangria-orders', []));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('sangria-orders', JSON.stringify(orders));
  }, [orders]);

  function login(userData) {
    const normalized = {
      name: userData.name ?? '',
      email: userData.email ?? '',
      phone: userData.phone ?? '',
      city: userData.city ?? '',
    };
    setUser(normalized);
    window.localStorage.setItem('sangria-user', JSON.stringify(normalized));
  }

  function updateProfile(profileData) {
    setUser((current) => {
      const updated = { ...current, ...profileData };
      window.localStorage.setItem('sangria-user', JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    setUser(null);
    setOrders([]);
    window.localStorage.removeItem('sangria-user');
    window.localStorage.removeItem('sangria-orders');
  }

  function addOrder(order) {
    setOrders((current) => [...current, order]);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, orders, addOrder, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
