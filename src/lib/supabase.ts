import { createClient } from '@supabase/supabase-js';

const DEMO_SUPABASE_URL = 'https://fprxdfltrvlwnqvzdqem.supabase.co';
const DEMO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcnhkZmx0cnZsd25xdnpkcWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc0MTYsImV4cCI6MjA5NDE1MzQxNn0.GiC4PXZwQJ8Zbo4lTPeB8_yQJElJQ25C3xOHOEGUA1s';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEMO_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEMO_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
