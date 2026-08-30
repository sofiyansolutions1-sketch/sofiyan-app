const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /console\.warn\(`Pincode API Timeout\/Error for area "\$\{req\.params\.area\}" \(using fallback\)`\);/g,
  "console.log(`Pincode API Timeout for area \"${req.params.area}\" (using fallback)`);"
);

content = content.replace(
  /console\.warn\(`Pincode API Timeout\/Error for PIN "\$\{req\.params\.pincode\}" \(using fallback\)`\);/g,
  "console.log(`Pincode API Timeout for PIN \"${req.params.pincode}\" (using fallback)`);"
);

fs.writeFileSync('server.ts', content);
