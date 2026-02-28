
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL atau Anon Key tidak ditemukan. Menggunakan mode Local Storage.');
    return null;
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
};

// Untuk kompatibilitas sementara jika ada yang mengimpor langsung
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? null as unknown as SupabaseClient 
  : createClient(supabaseUrl, supabaseAnonKey);
