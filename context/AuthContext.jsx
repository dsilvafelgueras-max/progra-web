'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('sangria-user');
    const savedOrders = localStorage.getItem('sangria-orders');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  function login(userData) {
    const normalized = {
      name: userData.name ?? '',
      email: userData.email ?? '',
      phone: userData.phone ?? '',
      city: userData.city ?? '',
    };
    setUser(normalized);
    localStorage.setItem('sangria-user', JSON.stringify(normalized));
  }

  function updateProfile(profileData) {
    setUser((current) => {
      const updated = { ...current, ...profileData };
      localStorage.setItem('sangria-user', JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    setUser(null);
    setOrders([]);
    localStorage.removeItem('sangria-user');
    localStorage.removeItem('sangria-orders');
  }

  function addOrder(order) {
    setOrders((current) => {
      const updated = [...current, order];
      localStorage.setItem('sangria-orders', JSON.stringify(updated));
      return updated;
    });
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
