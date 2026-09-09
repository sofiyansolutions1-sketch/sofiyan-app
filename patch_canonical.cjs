const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCanonical = "linkCanonical.setAttribute('href', `https://www.sofiyanhomeservice.com/${activeCity.toLowerCase()}`);";
const newCanonical = "linkCanonical.setAttribute('href', `https://www.sofiyanhomeservice.com/${activeCity.toLowerCase()}${serviceUrl ? '/' + serviceUrl.toLowerCase() : ''}`);";

content = content.replace(oldCanonical, newCanonical);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Canonical patched.");
