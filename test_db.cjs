const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://uivkbbhcttldqefj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('primary_partners').upsert({
        name: "Test User",
        email: "test_update@example.com",
        phone: "9999999998",
        partner_type: "Primary",
        wallet_balance: 0
    }, { onConflict: 'phone' }).select().single();
    console.log("Error:", error);
}
run();
