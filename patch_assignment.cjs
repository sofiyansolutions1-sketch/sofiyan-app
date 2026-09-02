const fs = require('fs');
let code = fs.readFileSync('components/NearbyTechniciansBlock.tsx', 'utf8');

const target = `    try {
       // Update booking status in supabase
       const { error } = await supabase.from('bookings').update({
         assigned_partner_id: calledTechnician.id,
         assigned_partner_name: calledTechnician.name,
         assigned_partner_phone: calledTechnician.phone,
         status: 'accepted'
       }).eq('id', bookingId);`;

const replacement = `    try {
       // Format booking IDs to handle 4-digit codes
       const ids = bookingId.split(',').map(id => {
           let queryId = id.trim();
           if (queryId.length === 4) {
               return \`b0000000-0000-4000-8000-00000000\${queryId}\`;
           }
           return queryId;
       });

       // Update booking status in supabase
       const { error } = await supabase.from('bookings').update({
         assigned_partner_id: calledTechnician.id,
         assigned_partner_name: calledTechnician.name,
         assigned_partner_phone: calledTechnician.phone,
         status: 'accepted'
       }).in('id', ids);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('components/NearbyTechniciansBlock.tsx', code);
    console.log("Replaced!");
} else {
    console.log("Not found.");
}
