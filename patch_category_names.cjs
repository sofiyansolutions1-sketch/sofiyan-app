const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

content = content.replace('name: "Electrician", image:', 'name: "Electrical", image:');
fs.writeFileSync('pages/CustomerPanel.tsx', content);
