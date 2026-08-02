import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase Client with environment variables.
// These variables will be injected automatically by Hostinger.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
