'use client';
import { createContext, useContext, useState, useEffect } from 'react';

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
    setUser(userData);
    localStorage.setItem('sangria-user', JSON.stringify(userData));
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
    <AuthContext.Provider value={{ user, login, logout, orders, addOrder }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
