const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// 1. Revert to original URLs
const oldCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/ndJhBGS.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/ndJhgt4.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/ndJj5Rs.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/ndJjizv.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/ndJwJIf.png" }
];`;

const newCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/nJSqYJt.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/nJS1G9e.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/nJSl9VV.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/nJScxae.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/nJSaR1t.png" }
];`;

content = content.replace(oldCategories, newCategories);

// 2. Change style for full size 16:9 images without padding
const oldContainerStyle = `className="w-full aspect-[16/9] bg-[#f4f5f6] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb] overflow-hidden"`;
const newContainerStyle = `className="w-full aspect-[16/9] bg-[#f4f5f6] rounded-[24px] sm:rounded-[32px] flex items-center justify-center transition-transform duration-300 group-hover:bg-[#ebebeb] overflow-hidden"`;

const oldImageStyle = `className="h-20 sm:h-28 md:h-36 lg:h-40 object-contain transition-transform duration-500 group-hover:scale-110"`;
const newImageStyle = `className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"`;

content = content.replace(oldContainerStyle, newContainerStyle);
content = content.replace(oldImageStyle, newImageStyle);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Images and styling patched.");
