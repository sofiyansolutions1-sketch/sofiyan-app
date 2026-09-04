const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldModalStart = `<Modal
        isOpen={isSeeAllModalOpen}
        onClose={() => setIsSeeAllModalOpen(false)}
        title="AC & Appliance Repair"
      >`;
const newModalStart = `<Modal
        isOpen={isSeeAllModalOpen}
        onClose={() => setIsSeeAllModalOpen(false)}
        title="AC & Appliance Repair"
        maxWidth="max-w-2xl"
      >`;

content = content.replace(oldModalStart, newModalStart);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Modal width patched.");
