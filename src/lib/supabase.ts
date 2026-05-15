import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-supabase.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-supabase';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Special client for admin operations (like creating users) that doesn't persist session
// This prevents the admin from being "logged out" when creating a new user via auth.signUp
export const createAdminClient = () => createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'aicondo360-admin-session', // Diferente para não colidir com a sessão principal
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }
});
