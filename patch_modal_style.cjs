const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldImageStyle = `className="w-full h-full object-cover" />
                     </div>`;
const newImageStyle = `className="w-12 h-12 sm:w-16 sm:h-16 object-contain mix-blend-multiply" />
                     </div>`;

content = content.replace(oldImageStyle, newImageStyle);
content = content.replace(oldImageStyle, newImageStyle);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
