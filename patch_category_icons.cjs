const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://i.postimg.cc/s2SR2Pvz/Chat-GPT-Image-Mar-25-2026-06-17-17-PM.png" },
    { id: "Electrician", name: "Electrical", image: "https://i.postimg.cc/tCXRmc7V/Chat-GPT-Image-Mar-25-2026-06-17-31-PM.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://i.postimg.cc/L5vSpHhY/Chat-GPT-Image-Mar-25-2026-06-17-26-PM.png" },
    { id: "Appliances", name: "Appliances", image: "https://i.postimg.cc/FsBtgCL8/Chat-GPT-Image-Mar-25-2026-06-17-13-PM.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://i.postimg.cc/0Np241Gb/Chat-GPT-Image-Mar-25-2026-06-16-45-PM.png" }
];`;

const newCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://cdn-icons-png.flaticon.com/512/3678/3678759.png" },
    { id: "Electrician", name: "Electrical", image: "https://cdn-icons-png.flaticon.com/512/2955/2955938.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://cdn-icons-png.flaticon.com/512/3094/3094132.png" },
    { id: "Appliances", name: "Appliances", image: "https://cdn-icons-png.flaticon.com/512/3815/3815309.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://cdn-icons-png.flaticon.com/512/2002/2002361.png" }
];`;

content = content.replace(oldCategories, newCategories);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Categories patched.");
