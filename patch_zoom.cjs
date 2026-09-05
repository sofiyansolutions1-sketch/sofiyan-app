const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldImageStyle = `className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"`;
const newImageStyle = `className="w-full h-full object-cover scale-[1.15] transition-transform duration-500 group-hover:scale-[1.25]"`;

content = content.replace(oldImageStyle, newImageStyle);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Image scale patched.");
