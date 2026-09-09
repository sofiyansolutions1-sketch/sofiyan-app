const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace 'LOCKED' with 'DETECTED ✓'
content = content.replace(/'LOCKED'/g, "'DETECTED ✓'");

fs.writeFileSync(path, content);
console.log("Patched CustomerPanel LOCKED text");
