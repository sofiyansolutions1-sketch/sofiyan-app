import { supabase } from './supabaseClient.ts';

async function test() {
  const dbPartner = {
    name: 'Test Partner',
    email: `test_${Date.now()}@example.com`,
    phone: `999999${Math.floor(Math.random() * 1000)}`,
    password: 'password123',
    status: 'pending',
    registration_fee_paid: false
  };

  const { data, error } = await supabase.from('primary_partners').insert(dbPartner).select().single();
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
