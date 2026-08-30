const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bvtqginkszmzzmetdjdm.supabase.co", "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq");

async function run() {
  const dbPartner = {
      name: "Test User",
      first_name: "Test",
      last_name: "User",
      email: "test.user@example.com",
      phone: "9876543210",
      password: "password123",
      alt_phone: "",
      gender: "male",
      age: 30,
      city: "Test City",
      address: undefined,
      pincode: "123456",
      lat: undefined,
      lng: undefined,
      service_areas: undefined,
      service_radius: undefined,
      categories: ["Plumber"],
      sub_categories: undefined,
      service_pincodes: undefined,
      experience: "5",
      aadhar_number: "123412341234",
      id_proof_url: "{}",
      status: "pending",
      earnings: 0,
      completed_jobs: 0,
      registration_fee_paid: false
  };

  console.log("Upserting...");
  const { data, error } = await supabase.from('primary_partners').upsert(dbPartner, { onConflict: 'id' }).select().single();
  console.log("Data:", data);
  console.log("Error:", error);
}

run();
