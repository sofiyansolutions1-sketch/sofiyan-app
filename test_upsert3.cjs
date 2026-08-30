const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bvtqginkszmzzmetdjdm.supabase.co", "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq");

async function run() {
  const { data, error } = await supabase.from('primary_partners').upsert({
     id: 'efc5be5f-2137-45dd-9ec7-7872d0f8a487', // The one from user's screenshot
     name: "Test Partner Updated",
     first_name: "Test",
     last_name: "Partner",
     email: "testpartner12345@example.com",
     phone: "9999999999",
     aadhar_number: "123456789012",
     id_proof_url: "{\"test\":\"yes\"}",
     categories: ["Plumber"]
  }, { onConflict: 'id' }).select().single();
  console.log("data:", data);
  console.log("error:", error);
}
run();
