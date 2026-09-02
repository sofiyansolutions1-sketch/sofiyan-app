const fs = require('fs');
let code = fs.readFileSync('components/NearbyTechniciansBlock.tsx', 'utf8');

const target = `       // Update booking status in supabase
       const { error } = await supabase.from('bookings').update({
         assigned_partner_id: calledTechnician.id,
         assigned_partner_name: calledTechnician.name,
         assigned_partner_phone: calledTechnician.phone,
         status: 'accepted'
       }).in('id', ids);
       
       if (error) throw error;
       
       setAssignmentSuccess(true);`;

const replacement = `       // Update booking status in supabase
       const { error } = await supabase.from('bookings').update({
         assigned_partner_id: calledTechnician.id,
         assigned_partner_name: calledTechnician.name,
         assigned_partner_phone: calledTechnician.phone,
         status: 'accepted'
       }).in('id', ids);
       
       if (error) throw error;
       
       // Force a refresh of the bookings in the global store to sync instantly
       useStore.getState().fetchBookings();
       
       setAssignmentSuccess(true);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('components/NearbyTechniciansBlock.tsx', code);
    console.log("Replaced!");
} else {
    console.log("Not found.");
}
