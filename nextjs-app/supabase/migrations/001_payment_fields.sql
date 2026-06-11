-- Mercado Pago: campos de estado de pago en orders.
-- Correr manualmente en el editor SQL de Supabase.

alter table public.orders
  add column if not exists payment_status text not null default 'pending',
  add column if not exists mp_payment_id text,
  add column if not exists mp_preference_id text;
