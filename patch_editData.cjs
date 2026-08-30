const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

content = content.replace(
  /const \[editData, setEditData\] = useState\(\{\n\s*name: '',/g,
  "const [editData, setEditData] = useState({\n    name: '',\n    address: '',"
);

fs.writeFileSync('pages/PartnerPanel.tsx', content);
