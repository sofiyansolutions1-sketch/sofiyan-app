const fs = require('fs');
let code = fs.readFileSync('components/NearbyTechniciansBlock.tsx', 'utf8');

const target = `       // Force a refresh of the bookings in the global store to sync instantly
       useStore.getState().fetchBookings();`;

const replacement = `       // Force a refresh of the bookings in the global store to sync instantly
       useStore.getState().fetchBookings();
       
       // Update partner status to busy so they don't get double booked
       await supabase.from('primary_partners').update({ status: 'busy' }).eq('id', calledTechnician.id);
       useStore.getState().fetchPartners();`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('components/NearbyTechniciansBlock.tsx', code);
    console.log("Replaced!");
} else {
    console.log("Not found.");
}
