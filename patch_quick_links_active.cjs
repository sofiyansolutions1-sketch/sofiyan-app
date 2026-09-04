const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Replace {currentCity} with {activeCity} only in the Quick Links area
// We can just replace all {currentCity} with {activeCity} in the entire file since currentCity is only really used as state there
content = content.replace(/\{currentCity\}/g, '{activeCity}');
content = content.replace(/\(currentCity\)/g, '(activeCity)');

fs.writeFileSync('pages/CustomerPanel.tsx', content);
