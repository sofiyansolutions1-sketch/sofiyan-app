const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldImageStyle = `className="w-12 h-12 sm:w-16 sm:h-16 object-contain mix-blend-multiply" />
                     </div>`;
                     
const newImageStyle = `className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     </div>`;                     

const oldBoxStyle = `className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 border border-gray-100 shadow-sm"`;
const newBoxStyle = `className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f4f5f6] rounded-[24px] overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb] mb-1"`;

content = content.replace(oldImageStyle, newImageStyle);
content = content.replace(oldImageStyle, newImageStyle);

content = content.replace(oldBoxStyle, newBoxStyle);
content = content.replace(oldBoxStyle, newBoxStyle);

const oldGap = `className="flex flex-col items-center gap-2 cursor-pointer group"`;
const newGap = `className="flex flex-col items-center gap-3 cursor-pointer group"`;
content = content.replace(oldGap, newGap);
content = content.replace(oldGap, newGap);
content = content.replace(oldGap, newGap);
content = content.replace(oldGap, newGap);
content = content.replace(oldGap, newGap);
content = content.replace(oldGap, newGap);
content = content.replace(oldGap, newGap);
content = content.replace(oldGap, newGap);

const oldText = `className="text-xs font-medium text-gray-700 text-center"`;
const newText = `className="text-[13px] sm:text-[15px] font-medium text-gray-900 text-center leading-tight"`;

content = content.replace(oldText, newText);
content = content.replace(oldText, newText);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Modal images and boxes patched.");
