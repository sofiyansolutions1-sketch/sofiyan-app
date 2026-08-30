const fs = require('fs');
const content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');
let depth = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') depth++;
  if (content[i] === '}') depth--;
}
console.log('Brace depth:', depth);
let paren = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '(') paren++;
  if (content[i] === ')') paren--;
}
console.log('Paren depth:', paren);
