const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// Restore state variables
const stateRegex = /const \[regData, setRegData\] = useState\(\{[\s\S]*?\}\);/;
code = code.replace(stateRegex, match => match + `

  const [isRpcMatching, setIsRpcMatching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
`);

// Also change back radiusStr and serviceRadius from const to let if needed
code = code.replace(/const radiusStr =/g, 'let radiusStr =');
code = code.replace(/const serviceRadius =/g, 'let serviceRadius =');

fs.writeFileSync('pages/PartnerPanel.tsx', code);
