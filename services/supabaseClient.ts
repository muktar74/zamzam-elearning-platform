
import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment variables provided by Vite.
// These should be configured in the project's .env file.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;


/**
 * A flag to check if the Supabase configuration is present.
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * The Supabase client instance.
 * It will only be created if the environment variables are set.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : {} as any; // Provide a dummy object if not configured to prevent crashes on import.
