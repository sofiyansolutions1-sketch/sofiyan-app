const fs = require('fs');

let content = fs.readFileSync('hooks/useStore.ts', 'utf8');

// Export mapBookingFromDB
content = content.replace('const mapBookingFromDB =', 'export const mapBookingFromDB =');

fs.writeFileSync('hooks/useStore.ts', content);
