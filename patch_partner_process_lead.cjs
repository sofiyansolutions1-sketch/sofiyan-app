const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Working Section/, 'Process Lead');

fs.writeFileSync(file, content);
console.log("Patched PartnerPanel.tsx Working Section to Process Lead");
