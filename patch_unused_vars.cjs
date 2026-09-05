const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

content = content.replace(/import \{[\s\S]*?\} from "lucide-react";/, (match) => {
  return match.replace(/Copy,\n\s*/, '');
});

content = content.replace(/const \[regCopiedUpi, setRegCopiedUpi\] = useState<boolean>\(false\);\n/, '');
content = content.replace(/const \[regAiResult, setRegAiResult\] = useState<any>\(null\);\n/, '');
content = content.replace(/const \[regAiScanProgress, setRegAiScanProgress\] = useState<number>\(0\);\n/, '');

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Unused vars removed.");
