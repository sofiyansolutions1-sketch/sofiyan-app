const fs = require('fs');

function patchContact(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('href="tel:+919876543210"', 'href="tel:+918115983887"');
  content = content.replace('href="https://wa.me/919876543210"', 'href="https://wa.me/918115983887"');
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}

patchContact('pages/ServicePage.tsx');
patchContact('pages/SubServicePage.tsx');
