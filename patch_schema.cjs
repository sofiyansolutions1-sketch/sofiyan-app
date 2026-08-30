const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bvtqginkszmzzmetdjdm.supabase.co", "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq");

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: `
    ALTER TABLE public.primary_partners
    ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS business_photos_urls JSONB DEFAULT '[]'::jsonb;
  `});
  console.log("data", data);
  console.log("error", error);
}
run();
