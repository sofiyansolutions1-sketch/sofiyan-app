const fs = require('fs');
const content = fs.readFileSync('hooks/useStore.ts', 'utf-8');
const oldText = `  addPartner: async (newPartner: Partner) => {
    const dbPartner = {
      name: newPartner.name,
      first_name: newPartner.first_name,
      last_name: newPartner.last_name,
      email: newPartner.email || \`\${newPartner.phone || Date.now()}@example.com\`,
      phone: newPartner.phone,
      password: newPartner.password,
      alt_phone: newPartner.alt_phone,
      gender: newPartner.gender,
      age: newPartner.age,
      city: newPartner.city,
      pincode: newPartner.pincode,
      categories: newPartner.categories,
      sub_categories: newPartner.sub_categories,
      service_pincodes: newPartner.service_pincodes,
      experience: newPartner.experience,
      aadhar_number: newPartner.aadhar_number,
      status: newPartner.status,
      earnings: newPartner.earnings,
      completed_jobs: newPartner.completedJobs,
      registration_fee_paid: false
    };`;

const newText = `  addPartner: async (newPartner: Partner) => {
    const dbPartner: any = {
      name: newPartner.name,
      first_name: newPartner.first_name,
      last_name: newPartner.last_name,
      email: newPartner.email || \`\${newPartner.phone || Date.now()}@example.com\`,
      phone: newPartner.phone,
      password: newPartner.password,
      alt_phone: newPartner.alt_phone,
      gender: newPartner.gender,
      age: newPartner.age,
      city: newPartner.city,
      pincode: newPartner.pincode,
      categories: newPartner.categories,
      sub_categories: newPartner.sub_categories,
      service_pincodes: newPartner.service_pincodes,
      experience: newPartner.experience,
      aadhar_number: newPartner.aadhar_number,
      status: newPartner.status,
      earnings: newPartner.earnings,
      completed_jobs: newPartner.completedJobs,
      registration_fee_paid: false
    };
    
    // Only pass ID if it's a valid UUID (not our fallback "P12345...")
    if (newPartner.id && !newPartner.id.startsWith('P')) {
       dbPartner.id = newPartner.id;
    }`;

if(content.includes(oldText)) {
   fs.writeFileSync('hooks/useStore.ts', content.replace(oldText, newText));
   console.log('Success!');
} else {
   console.log('Not found!');
}
