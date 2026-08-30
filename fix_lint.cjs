const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

code = code.replace(/let businessUrls: string\[\] = \[\];/, 'const businessUrls: string[] = [];');
code = code.replace(/ShieldCheck, /, '');

fs.writeFileSync('pages/PartnerPanel.tsx', code);
