const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// replace await updatePartner({...}) with await updatePartner({...} as Partner)
// but wait, there are multiple. 
// A simpler way: Find `await updatePartner({` and replace up to `})` is hard with regex. 

content = content.replace(/await updatePartner\(\{[\s\S]*?\}\);/g, (match) => {
  return match.replace(/\} \);$/, '} as Partner);').replace(/\}\);$/, '} as Partner);');
});

content = content.replace(/setCurrentUser\(\{[\s\S]*?\}\);/g, (match) => {
  return match.replace(/\} \);$/, '} as Partner);').replace(/\}\);$/, '} as Partner);');
});

fs.writeFileSync('pages/PartnerPanel.tsx', content);
