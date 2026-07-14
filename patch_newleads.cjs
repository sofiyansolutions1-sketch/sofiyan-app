const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const newLeads = bookings\.filter\(b => \s*b\.status === 'pending' && \s*\(currentUser\.categories \|\| \[\]\)\.includes\(b\.serviceCategory\) && \s*\(currentUser\.service_pincodes \|\| \[\]\)\.includes\(b\.pinCode\)\s*\);/;

const replacement = `const newLeads = bookings.filter(b => {
    if (b.status !== 'pending') return false;
    
    const partnerPins = currentUser.service_pincodes || [];
    if (!partnerPins.includes(b.pinCode)) return false;

    const partnerCats = currentUser.categories || [];
    const partnerSubCats = currentUser.sub_categories || [];
    
    const catMatch = partnerCats.includes(b.serviceCategory) || 
                     (partnerCats.includes('Home Appliances') && b.serviceCategory === 'Appliances') ||
                     (partnerCats.includes('Appliances') && b.serviceCategory === 'Home Appliances') ||
                     (partnerCats.includes('Cleaning & Pest Control') && (b.serviceCategory === 'Cleaning' || b.serviceCategory === 'Pest Control'));
                     
    const subCatMatch = partnerSubCats.some(sub => 
        (b.subServiceName && b.subServiceName.includes(sub)) || 
        (b.serviceCategory && b.serviceCategory.includes(sub))
    );
    
    return catMatch || subCatMatch;
  });`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log("Patched newLeads logic");
