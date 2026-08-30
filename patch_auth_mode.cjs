const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// Add useLocation import if not there
if (!code.includes("useLocation")) {
   code = code.replace("import { Link", "import { Link, useLocation");
   if (!code.includes("useLocation")) {
       code = code.replace("import { Briefcase", "import { useLocation } from 'react-router-dom';\nimport { Briefcase");
   }
}

// Update useState for authMode
const oldAuthMode = "const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');";
const newAuthMode = `  const location = useLocation();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') === 'signup' ? 'signup' : 'login';
  });`;

code = code.replace(oldAuthMode, newAuthMode);
fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Patched authMode initialization");
