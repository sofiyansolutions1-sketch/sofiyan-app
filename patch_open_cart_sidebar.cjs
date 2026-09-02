const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

code = code.replace(/if \(\(window as any\).openCartSidebar\) {\s*\(window as any\).openCartSidebar\(\);\s*}/g, "window.dispatchEvent(new Event('sofiyan_open_side_cart'));");

fs.writeFileSync('pages/CustomerPanel.tsx', code);
console.log("Done");
