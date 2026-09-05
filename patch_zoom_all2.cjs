const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldImageStyle = `className="w-full h-full object-cover scale-[1.15] transition-transform duration-500 group-hover:scale-[1.25]"`;
const newImageStyle = `className="w-full h-full object-cover scale-[1.25] transition-transform duration-500 group-hover:scale-[1.35]"`;

content = content.replaceAll(oldImageStyle, newImageStyle);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Image scale patched all 2.");
