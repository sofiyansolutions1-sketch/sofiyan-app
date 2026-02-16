import { createClient } from '@supabase/supabase-js';

// Use environment variables for Netlify, but keep hardcoded values as fallback so it works instantly.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://bvtqginkszmzzmetdjdm.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);