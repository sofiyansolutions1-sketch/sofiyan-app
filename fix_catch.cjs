const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

content = content.replace(/catch \{[\s\S]*?console\.warn\("Reverse geocoding failed", e\);[\s\S]*?\}/g, 'catch (e) {\n           console.warn("Reverse geocoding failed", e);\n        }');

fs.writeFileSync('pages/CustomerPanel.tsx', content);
