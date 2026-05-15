import { createClient } from '@supabase/supabase-js';

const APP_SUPABASE_URL = 'https://ljsdoeyiwlrvcqeyfkya.supabase.co';
const APP_SUPABASE_ANON_KEY = 'sb_publishable_NDQm7ShVT_U_ZghQBE2RAg_ra8vke9j';

const ATTENDANCE_SUPABASE_URL = 'https://fprxdfltrvlwnqvzdqem.supabase.co';
const ATTENDANCE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcnhkZmx0cnZsd25xdnpkcWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1Nzc0MTYsImV4cCI6MjA5NDE1MzQxNn0.GiC4PXZwQJ8Zbo4lTPeB8_yQJElJQ25C3xOHOEGUA1s';

const appSupabaseUrl = (import.meta.env.VITE_APP_SUPABASE_URL as string | undefined) || APP_SUPABASE_URL;
const appSupabaseAnonKey = (import.meta.env.VITE_APP_SUPABASE_ANON_KEY as string | undefined) || APP_SUPABASE_ANON_KEY;

const attendanceSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || ATTENDANCE_SUPABASE_URL;
const attendanceSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || ATTENDANCE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(attendanceSupabaseUrl && attendanceSupabaseAnonKey);
export const isAppSupabaseConfigured = Boolean(appSupabaseUrl && appSupabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(attendanceSupabaseUrl!, attendanceSupabaseAnonKey!)
  : null;

export const appSupabase = isAppSupabaseConfigured
  ? createClient(appSupabaseUrl!, appSupabaseAnonKey!)
  : null;
