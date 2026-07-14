const fs = require('fs');
const code = fs.readFileSync('/app/applet/dist/assets/main-CRkuwuQT.js', 'utf8');
const search = 'Partner Onboarding 👋';
const idx = code.indexOf(search);
if (idx === -1) {
  console.log('Not found');
  process.exit(1);
}
console.log(code.substring(Math.max(0, idx - 5000), idx + 10000));
