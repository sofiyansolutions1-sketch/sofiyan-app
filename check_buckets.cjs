const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bvtqginkszmzzmetdjdm.supabase.co", "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq");
async function run() {
  const { data } = await supabase.storage.listBuckets();
  console.log(data);
}
run();
