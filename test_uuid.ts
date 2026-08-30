import { supabase } from './supabaseClient';

async function test() {
    const trackingId = Math.floor(1000 + Math.random() * 9000).toString();
    const customId = `00000000-0000-0000-0000-00000000${trackingId}`;
    console.log("Inserting:", customId);
    
    const { data, error } = await supabase.from('bookings').insert([{
        id: customId,
        customer_id: '00000000-0000-0000-0000-000000000000',
        customer_name: 'test',
        contact_number: '1234567890',
        date: '2026-01-01',
        time: '10:00 AM',
        address: 'test address',
        area: 'test area',
        city: 'test city',
        pin_code: '123456',
        cart_items: [],
        price: 100,
        service_category: 'test'
    }]).select('id').single();
    
    console.log("Error:", error);
    console.log("Data:", data);
}

test();
