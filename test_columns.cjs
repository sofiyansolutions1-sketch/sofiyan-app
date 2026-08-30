const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bvtqginkszmzzmetdjdm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('bookings').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns in bookings table:', Object.keys(data[0] || {}));
  }
}

main();
