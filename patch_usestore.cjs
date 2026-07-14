const fs = require('fs');
const file = 'hooks/useStore.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \{ error \} = await supabase\.from\('primary_partners'\)\.update\(\{\n\s*status: updatedPartner\.status,\n\s*earnings: updatedPartner\.earnings,\n\s*completed_jobs: updatedPartner\.completedJobs,\n\s*rating: updatedPartner\.rating,\n\s*review_count: updatedPartner\.review_count\n\s*\}\)\.eq\('id', updatedPartner\.id\);/g,
  `const { error } = await supabase.from('primary_partners').update({
         status: updatedPartner.status,
         earnings: updatedPartner.earnings,
         completed_jobs: updatedPartner.completedJobs,
         rating: updatedPartner.rating,
         review_count: updatedPartner.review_count,
         name: updatedPartner.name,
         phone: updatedPartner.phone,
         pincode: updatedPartner.pincode,
         city: updatedPartner.city,
         categories: updatedPartner.categories,
         sub_categories: updatedPartner.sub_categories,
         service_pincodes: updatedPartner.service_pincodes
     }).eq('id', updatedPartner.id);`
);

fs.writeFileSync(file, content);
console.log("Patched useStore.ts");
