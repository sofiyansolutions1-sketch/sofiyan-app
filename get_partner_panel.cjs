const fs = require('fs');
const code = fs.readFileSync('/app/applet/temp_script_0.js', 'utf8');
const idx = code.indexOf('PartnerPanel');
console.log(idx);
if (idx !== -1) {
    console.log(code.substring(Math.max(0, idx - 100), idx + 2000));
}
