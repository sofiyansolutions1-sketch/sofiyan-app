const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://uivkbbhcttldqefj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    const dbPartnerPayload = {
        name: "Test User",
        first_name: "Test",
        last_name: "User",
        email: "test88@example.com",
        phone: "9999999988",
        password: "password123",
        alt_phone: "",
        gender: "Male",
        age: 25,
        experience: "2",
        city: "Test City",
        address: "Test City",
        pincode: "123456",
        lat: null,
        lng: null,
        partner_type: "Primary",
        service_areas: ["5"],
        service_radius: 5,
        service_pincodes: ["123456"],
        categories: ["Electrician"],
        sub_categories: [],
        aadhar_number: "123456789012",
        id_proof_url: "{}",
        status: "available",
        earnings: 0,
        completed_jobs: 0,
        rating: 5.0,
        review_count: 0,
        registration_fee_paid: true,
        wallet_balance: 0
    };

    const { data, error } = await supabase
        .from("primary_partners")
        .upsert(dbPartnerPayload, { onConflict: "phone" })
        .select()
        .single();
        
    console.log("Upsert Error:", error);
    console.log("Upsert Data:", data);
}
run();
