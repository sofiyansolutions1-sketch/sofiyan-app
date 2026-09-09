const fs = require('fs');

function patchContactDynamic(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add adminPhone at the top of the component
  if (!content.includes('const adminPhone')) {
    content = content.replace('const activeCity', "const adminPhone = ((import.meta as any).env.VITE_ADMIN_PHONE || '8115983887').replace(/\\+/g, '');\n  const activeCity");
  }

  // Replace hardcoded links with dynamic ones
  content = content.replace(/href="tel:\+918115983887"/g, 'href={`tel:+91${adminPhone}`}');
  content = content.replace(/href="https:\/\/wa\.me\/918115983887"/g, 'href={`https://wa.me/91${adminPhone}`}');
  
  fs.writeFileSync(file, content);
  console.log(`Patched ${file} dynamically`);
}

patchContactDynamic('pages/ServicePage.tsx');
patchContactDynamic('pages/SubServicePage.tsx');
