const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const regex = /const handleCurrentLocation = async \(\) => \{[\s\S]*?case error\.TIMEOUT:[\s\S]*?alert\(errorMessage\);\s*\},[\s\S]*?\{ enableHighAccuracy: true, timeout: 14000, maximumAge: 0 \}\s*\);\s*\};/;
// Wait, my previous sed replaced things so the current state in file is weird.
