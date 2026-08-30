const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bvtqginkszmzzmetdjdm.supabase.co", "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq");

async function run() {
  const { data, error } = await supabase.storage.createBucket('app-files', { public: true });
  console.log("data", data);
  console.log("error", error);
}
run();
