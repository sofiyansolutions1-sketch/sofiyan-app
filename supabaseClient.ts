import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bvtqginkszmzzmetdjdm.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);