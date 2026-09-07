import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Enhanced Supabase client configuration with connection pooling
const supabaseConfig = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Connection': 'keep-alive',
    },
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        return await fetch(input, { ...init, signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
    },
  },
};

// Only create client if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)
  : null;

// For server-side operations with service role key
export const supabaseAdmin = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        ...supabaseConfig,
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  : null;

// Connection pool health check
let connectionHealth = 'unknown';
let lastHealthCheck = 0;

async function checkConnectionHealth(): Promise<boolean> {
  const now = Date.now();
  // Cache health check result for 30 seconds
  if (connectionHealth !== 'unknown' && now - lastHealthCheck < 30000) {
    return connectionHealth === 'healthy';
  }

  try {
    if (!supabaseAdmin) {
      connectionHealth = 'unhealthy';
      lastHealthCheck = now;
      return false;
    }

    const { error } = await supabaseAdmin
      .from('schools')
      .select('id')
      .limit(1)
      .maybeSingle();

    connectionHealth = error ? 'unhealthy' : 'healthy';
    lastHealthCheck = now;
    return !error;
  } catch (error) {
    connectionHealth = 'unhealthy';
    lastHealthCheck = now;
    return false;
  }
}

// Helper function to check database connection
export function checkDatabaseConnection() {
  if (!supabaseAdmin) {
    throw new Error('Database connection not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
}

// Export health check function
export { checkConnectionHealth, connectionHealth };
