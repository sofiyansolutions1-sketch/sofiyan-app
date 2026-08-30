const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

code = code.replace(/const startCamera = async \(\) => \{/g, 'async function startCamera() {');
code = code.replace(/const stopCamera = \(\) => \{/g, 'function stopCamera() {');
code = code.replace(/const capturePhoto = \(\) => \{/g, 'function capturePhoto() {');

fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log('Hoisting fixed');
