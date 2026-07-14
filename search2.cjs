const fs = require('fs');
const code = fs.readFileSync('netlify-dist/api.js', 'utf8');
const index = code.indexOf('Partner Onboarding');
console.log("In api.js:", index);
