import { createClient } from '@supabase/supabase-js';

// Cliente para API routes y Server Components.
// Usa la service role key — nunca la expongas al cliente.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
