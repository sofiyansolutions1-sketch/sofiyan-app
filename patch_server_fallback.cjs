const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the area catch block
content = content.replace(
  /catch \(error: any\) \{\s*console\.error\(`Pincode API Error for area "\$\{req\.params\.area\}"`, error\.message\);\s*res\.status\(502\)\.json\(\{ error: "Failed to query India Post API" \}\);\s*\}/,
  `catch (error: any) {
      console.warn(\`Pincode API Timeout/Error for area "\${req.params.area}" (using fallback)\`);
      res.json([{ Status: "Error", Message: "Timeout or API unreachable", PostOffice: null }]);
    }`
);

// Replace the pincode catch block
content = content.replace(
  /catch \(error: any\) \{\s*console\.error\(`Pincode API Error for PIN "\$\{req\.params\.pincode\}":`, error\.message\);\s*res\.status\(502\)\.json\(\{ error: "Failed to query India Post API" \}\);\s*\}/,
  `catch (error: any) {
      console.warn(\`Pincode API Timeout/Error for PIN "\${req.params.pincode}" (using fallback)\`);
      res.json([{ Status: "Error", Message: "Timeout or API unreachable", PostOffice: null }]);
    }`
);

fs.writeFileSync('server.ts', content);
