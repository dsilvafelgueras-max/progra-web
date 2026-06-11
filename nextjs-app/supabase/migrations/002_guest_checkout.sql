-- Checkout sin login: orders.user_id pasa a ser opcional.
-- Correr manualmente en el editor SQL de Supabase.

alter table public.orders
  alter column user_id drop not null;
