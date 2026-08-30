const fs = require('fs');
let code = fs.readFileSync('hooks/useStore.ts', 'utf8');

code = code.replace(
  /\/\/ Do not throw so that local state remains updated/g,
  "throw error;"
);

fs.writeFileSync('hooks/useStore.ts', code);
console.log("updatePartner now throws error.");
