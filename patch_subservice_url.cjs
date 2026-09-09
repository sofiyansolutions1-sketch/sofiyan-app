const fs = require('fs');

let content = fs.readFileSync('pages/SubServicePage.tsx', 'utf8');

const target = "const subService = service?.subServices?.find(s => s.name.replace(/\\s+/g, '-').toLowerCase() === subServiceUrl?.toLowerCase() || s.name.replace(/[^a-zA-Z0-9]/g, \"-\").toLowerCase() === subServiceUrl?.toLowerCase());";

const replacement = `const subService = service?.subServices?.find(s => {
    const slug1 = s.name.replace(/\\s+/g, '-').toLowerCase();
    const slug2 = s.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const slug3 = s.name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const url = subServiceUrl?.toLowerCase();
    return slug1 === url || slug2 === url || slug3 === url;
  });`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('pages/SubServicePage.tsx', content);
  console.log('Patched SubServicePage.tsx');
} else {
  console.log('Could not find target string.');
}
