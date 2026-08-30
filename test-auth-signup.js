import { supabase } from './supabaseClient.ts';
async function test() {
  const email = `test_${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        name: 'Test Partner',
        phone: '9999991234',
        role: 'partner'
      }
    }
  });
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
