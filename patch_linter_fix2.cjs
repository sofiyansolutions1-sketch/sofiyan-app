const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// The linter says: 'regFeePathOrUrl' is never reassigned. Use 'const' instead
content = content.replace(/let regFeePathOrUrl = "";/g, 'const regFeePathOrUrl = "";');

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Linter error patched.");
