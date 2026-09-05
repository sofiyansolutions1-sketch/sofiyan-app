const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/nJSqYJt.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/nJS1G9e.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/nJSl9VV.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/nJScxae.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/nJSaR1t.png" }
];`;

const newCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/ndJhBGS.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/ndJhgt4.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/ndJj5Rs.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/ndJjizv.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/ndJwJIf.png" }
];`;

content = content.replace(oldCategories, newCategories);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Images patched.");
