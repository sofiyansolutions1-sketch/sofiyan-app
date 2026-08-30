const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// Remove the available status check for newLeads
content = content.replace(
  /\s*\/\/\s*Advanced condition: Partner must be 'available' to receive new automatic leads\s*if\s*\(currentUser\.status\s*!==\s*'available'\)\s*return\s*false;/,
  ''
);

// Update handleAcceptLead
const acceptRegex = /const handleAcceptLead = async \(lead: Booking\) => \{[\s\S]*?\}\);[\s\S]*?\};/;
const acceptReplacement = `const handleAcceptLead = async (lead: Booking) => {
    if (activeJob) {
      alert("You can only accept one lead at a time. Please complete your current job first.");
      return;
    }
    
    // Update booking
    await updateBooking({
      ...lead,
      status: 'accepted',
      assignedPartnerId: currentUser.id,
      assignedPartnerName: currentUser.name,
      assignedPartnerPhone: currentUser.phone,
      assignedPartnerArea: currentUser.city || currentUser.pincode
    });
    
    // Change partner status to busy
    if (currentUser) {
       const updatedPartner = { ...currentUser, status: 'busy' as const };
       await updatePartner(updatedPartner);
       setCurrentUser(updatedPartner);
    }
  };`;

content = content.replace(acceptRegex, acceptReplacement);

fs.writeFileSync('pages/PartnerPanel.tsx', content);
