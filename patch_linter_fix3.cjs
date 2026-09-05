const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

content = content.replace(/let regFeePathOrUrl: string \| null = null;/g, 'const regFeePathOrUrl: string | null = null;');

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Linter error patched.");
