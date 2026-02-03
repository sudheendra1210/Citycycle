import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Safe initialization to prevent crash during migration
let supabase = null;

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: (import.meta.env.VITE_AUTH_PROVIDER === 'clerk') ? {
            autoRefreshToken: false,
            persistSession: false
        } : {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} else {
    console.warn('Supabase not initialized: Missing or invalid environment variables.');
}

export { supabase };
