import { createClient } from '@supabase/supabase-js';

// Cliente para usar en componentes del lado del cliente ('use client')
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
