'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper: fetch autenticado con el token guardado
function authHeader() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('sangria-token')
    : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // true mientras verifica sesión

  // Al montar: restaurar sesión desde token guardado
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('sangria-token');
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          await fetchOrders(token);
        } else {
          // Token vencido o inválido
          localStorage.removeItem('sangria-token');
        }
      } catch { /* network error: dejamos user = null */ }

      setLoading(false);
    }
    restoreSession();
  }, []);

  async function fetchOrders(token) {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch {}
  }

  // Inicia sesión — lanza un Error con mensaje legible si falla
  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error al iniciar sesión');

    localStorage.setItem('sangria-token', data.access_token);
    setUser(data.user);
    await fetchOrders(data.access_token);
    return data;
  }

  // Registra usuario nuevo — lanza Error si falla
  async function register(email, password, name) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error al registrarse');

    // Supabase puede requerir confirmación de email antes de dar sesión
    if (data.session) {
      localStorage.setItem('sangria-token', data.session.access_token);
      setUser(data.user);
    }
    return data;
  }

  async function logout() {
    const token = localStorage.getItem('sangria-token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem('sangria-token');
    setUser(null);
    setOrders([]);
  }

  // Crea una orden en Supabase y la agrega al estado local
  async function addOrder(orderData) {
    const token = localStorage.getItem('sangria-token');
    if (!token) return null;

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) return null;

    const order = await res.json();
    setOrders((prev) => [order, ...prev]);
    return order;
  }

  return (
    <AuthContext.Provider value={{ user, loading, orders, login, register, logout, addOrder }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
