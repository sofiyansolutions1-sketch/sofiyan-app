const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bvtqginkszmzzmetdjdm.supabase.co", "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq");

async function run() {
  const email = "test123123@example.com";
  const password = "password123";
  const { data: authDataRes, error: authErrorRes } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: "Test Name",
          phone: "1231231231",
          role: 'partner'
        }
      }
  });

  let partnerId = authDataRes.user?.id;
  if (authErrorRes) {
    console.log("Auth Error:", authErrorRes.message);
    if (authErrorRes.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (signInError) throw new Error("User already registered. Please login instead.");
        partnerId = signInData.user?.id;
    } else {
        throw authErrorRes;
    }
  }

  partnerId = partnerId || "P" + Date.now();
  console.log("Partner ID:", partnerId);
  
  const newPartner = {
    id: partnerId,
    name: "Test Name",
    first_name: "Test",
    last_name: "Name",
    email: email,
    phone: "1231231231",
    password: password,
    city: "Test",
    alt_phone: "",
    gender: "male",
    age: 30,
    experience: "5",
    categories: ["Test"],
    sub_categories: [],
    service_pincodes: [],
    aadhar_number: "111122223333",
    id_proof_url: "{}",
    status: 'pending',
    earnings: 0,
    completed_jobs: 0,
    lat: 0,
    lng: 0,
    pincode: "111111",
    registration_fee_paid: false
  };

  const { data: upsertData, error: upsertError } = await supabase.from('primary_partners').upsert(newPartner, { onConflict: 'id' }).select().single();
  console.log("Upsert Data:", upsertData);
  console.log("Upsert Error:", upsertError);
}

run();
