import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    );
  }
  // In development, warn but allow the app to start (for UI development without DB)
  console.warn(
    '⚠️  Supabase environment variables not set. Database features will not work.'
  );
}

// Create client only if variables are set
// In production, this will throw if variables are missing (caught above)
// In development, we allow null for UI development without DB
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;

// Server-side client with service role key (optional)
// Only needed for admin operations that bypass RLS
// Most operations can use the regular supabase client with RLS policies
export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    // Fall back to anon key if service role key is not provided
    // This works for most operations when RLS policies are properly configured
    if (process.env.NODE_ENV === 'production') {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set - using anon key. Some admin operations may not work.');
    }
    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }
    return supabaseClient;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

