const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /timeout: 15000/g,
  "timeout: 4000"
);

fs.writeFileSync('server.ts', content);
