const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/value=\{editData\.service_pincodes\.join\(\', \'\)\}/g, "value={(editData.service_pincodes || []).join(', ')}");
content = content.replace(/value=\{editData\.categories\.join\(\', \'\)\}/g, "value={(editData.categories || []).join(', ')}");
content = content.replace(/value=\{editData\.sub_categories\.join\(\', \'\)\}/g, "value={(editData.sub_categories || []).join(', ')}");

fs.writeFileSync(file, content);
console.log("Patched PartnerPanel.tsx undefined safety");
