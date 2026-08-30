const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /catch \(error: any\) \{\s*console\.error\(`Pincode API Error for area "\$\{req\.params\.area\}":`, error\.message\);\s*res\.status\(502\)\.json\(\{ error: "Failed to query India Post API" \}\);\s*\}/,
  `catch (error: any) {
      console.warn(\`Pincode API Timeout/Error for area "\${req.params.area}" (using fallback)\`);
      res.json([{ Status: "Error", Message: "Timeout or API unreachable", PostOffice: null }]);
    }`
);

fs.writeFileSync('server.ts', content);
