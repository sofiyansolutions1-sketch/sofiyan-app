const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

code = code.replace(
    '                </div>\n                <div className="flex gap-4 pt-8">',
    '                )}</div>\n                <div className="flex gap-4 pt-8">'
);

fs.writeFileSync('pages/PartnerPanel.tsx', code);
