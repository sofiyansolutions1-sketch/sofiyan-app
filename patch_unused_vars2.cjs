const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const regex1 = /const \[regCopiedUpi, setRegCopiedUpi\] = useState\(false\);\n/;
const regex2 = /const \[regAiResult, setRegAiResult\] = useState<\{[\s\S]*?\} \| null>\(null\);\n/;
const regex3 = /const \[regAiScanProgress, \] = useState<string>\(""\);\n/;

content = content.replace(regex1, "");
content = content.replace(regex2, "");
content = content.replace(regex3, "");

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Unused vars removed again.");
