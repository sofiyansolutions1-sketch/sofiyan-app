const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');
code = code.replace(/} catch \{\s*console\.error\("RPC distance matching failed:", err\);\s*\} finally \{\s*\}/g, '} catch (err) { console.error("RPC distance matching failed:", err); }');
fs.writeFileSync('pages/PartnerPanel.tsx', code);
