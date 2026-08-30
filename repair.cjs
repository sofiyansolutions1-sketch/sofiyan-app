const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

content = content.replace(/const \[authData, setAuthData\] = useState\(\{ phone: '', password: '', name: '', email: '' \}\);\n\s*address: "",/g, 
  "const [authData, setAuthData] = useState({ phone: '', password: '', name: '', email: '' });\n  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');");

content = content.replace(/setAuthData\(\{ phone: '', password: '', name: '', email: '' \}\);\n\s*address: "",/g, 
  "setAuthData({ phone: '', password: '', name: '', email: '' });");

fs.writeFileSync('pages/PartnerPanel.tsx', content);
