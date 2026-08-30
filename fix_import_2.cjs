const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');
content = content.replace("import { MapRadiusSelector } from '../components/MapRadiusSelector';", '');
fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Removed MapRadiusSelector import");
