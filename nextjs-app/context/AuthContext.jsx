'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const CART_KEY    = 'sangria-next-cart';
const TOKEN_KEY   = 'sangria-token';
const SESSION_COOKIE = 'sangria-session';

// ── Helpers de cookie ──────────────────────────────────────────────────────
// La cookie le dice al middleware (server) que el usuario tiene sesión.
// El JWT real vive en localStorage y lo usan las API routes.

function setSessionCookie() {
  // 7 días, SameSite=Lax, accesible en todo el sitio
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=604800; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Merge del carrito invitado → Supabase ──────────────────────────────────
// Al hacer login, si había ítems en localStorage los subimos a Supabase.
// Usa UPSERT, así si el producto ya estaba en el carrito suma la cantidad.

async function mergeGuestCart(token) {
  const saved = localStorage.getItem(CART_KEY);
  if (!saved) return;

  let localCart;
  try { localCart = JSON.parse(saved); } catch { return; }
  if (!Array.isArray(localCart) || localCart.length === 0) return;

  // Primero obtener el carrito actual en Supabase para sumar cantidades
  let supabaseCart = [];
  try {
    const res = await fetch('/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) supabaseCart = await res.json();
  } catch { /* si falla, upsert con cantidad local */ }

  // Para cada ítem local, calcular la cantidad final (local + supabase)
  await Promise.all(
    localCart.map(async (localItem) => {
      const existing = supabaseCart.find((s) => s.product_id === localItem.id);
      const finalQty = (existing?.quantity ?? 0) + localItem.quantity;

      try {
        await fetch(`/api/cart/${localItem.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: finalQty }),
        });
      } catch { /* silenciar error individual */ }
    })
  );

  // Limpiar carrito local después del merge
  localStorage.removeItem(CART_KEY);
}

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  // Al montar: restaurar sesión desde token guardado
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setProfile({
            fullName: userData.name,
            phone:    userData.phone,
            address:  userData.address,
            city:     userData.city,
          });
          setSessionCookie();   // asegurar que la cookie esté presente
          await fetchOrders(token);
        } else {
          // Token vencido o inválido
          localStorage.removeItem(TOKEN_KEY);
          clearSessionCookie();
        }
      } catch { /* network error */ }

      setLoading(false);
    }
    restoreSession();
  }, []);

  // ── Órdenes ────────────────────────────────────────────────────────────
  async function fetchOrders(token) {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch {}
  }

  // ── Perfil ─────────────────────────────────────────────────────────────
  async function updateProfile(fields) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Error al actualizar perfil');
    }
    const updated = await res.json();
    setProfile({
      fullName: updated.full_name,
      phone:    updated.phone,
      address:  updated.address,
      city:     updated.city,
    });
    setUser((prev) => prev ? { ...prev, name: updated.full_name } : prev);
    return updated;
  }

  // ── Login ──────────────────────────────────────────────────────────────
  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error al iniciar sesión');

    const token = data.access_token;
    localStorage.setItem(TOKEN_KEY, token);

    // 1. Setear cookie para el middleware (antes de setUser para que
    //    el middleware vea la sesión si el router redirige)
    setSessionCookie();

    // 2. Mergear carrito invitado → Supabase (antes de que CartContext
    //    recargue el carrito al detectar el cambio de user)
    await mergeGuestCart(token);

    // 3. Actualizar estado
    setUser(data.user);
    setProfile({
      fullName: data.user?.user_metadata?.name ?? null,
      phone:    null,
      address:  null,
      city:     null,
    });
    await fetchOrders(token);
    return data;
  }

  // ── Registro ───────────────────────────────────────────────────────────
  async function register(email, password, name) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error al registrarse');

    if (data.session) {
      const token = data.session.access_token;
      localStorage.setItem(TOKEN_KEY, token);
      setSessionCookie();
      await mergeGuestCart(token);
      setUser(data.user);
      setProfile({ fullName: name, phone: null, address: null, city: null });
    }
    return data;
  }

  // ── Logout ─────────────────────────────────────────────────────────────
  async function logout() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem(TOKEN_KEY);
    clearSessionCookie();
    setUser(null);
    setProfile(null);
    setOrders([]);
  }

  // ── Crear orden ────────────────────────────────────────────────────────
  async function addOrder(orderData) {
    const token = localStorage.getItem(TOKEN_KEY);
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
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      orders,
      login,
      register,
      logout,
      addOrder,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
