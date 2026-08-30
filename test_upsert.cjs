const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bvtqginkszmzzmetdjdm.supabase.co", "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq");

async function run() {
  const { data, error } = await supabase.from('primary_partners').upsert({
    name: 'Test Partner',
    first_name: 'Test',
    last_name: 'Partner',
    email: 'testpartner12345@example.com',
    phone: '9999999999',
    id_proof_url: '{"profile": "test"}'
  }, { onConflict: 'email' }).select();
  console.log("data", data);
  console.log("error", error);
}
run();
