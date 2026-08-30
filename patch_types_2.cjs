const fs = require('fs');
let content = fs.readFileSync('types.ts', 'utf8');

content = content.replace(
  /status: 'pending' \| 'accepted' \| 'completed' \| 'cancelled' \| 'Forwarded' \| 'on_hold';/,
  "status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'Forwarded' | 'on_hold';"
);

fs.writeFileSync('types.ts', content);
