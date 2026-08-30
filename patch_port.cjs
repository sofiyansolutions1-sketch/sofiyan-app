const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace PORT reading
code = code.replace(/const PORT = process\.env\.PORT \|\| 3000;/, 'const PORT = 3000;');
// Just in case it's different
code = code.replace(/const PORT = process\.env\.PORT[^;]*;/, 'const PORT = 3000;');

fs.writeFileSync('server.ts', code);
console.log("Patched PORT in server.ts");
