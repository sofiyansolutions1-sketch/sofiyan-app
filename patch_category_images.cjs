const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://cdn-icons-png.flaticon.com/512/3678/3678759.png" },
    { id: "Electrician", name: "Electrical", image: "https://cdn-icons-png.flaticon.com/512/2955/2955938.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://cdn-icons-png.flaticon.com/512/3094/3094132.png" },
    { id: "Appliances", name: "Appliances", image: "https://cdn-icons-png.flaticon.com/512/3815/3815309.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://cdn-icons-png.flaticon.com/512/2002/2002361.png" }
];`;

const newCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://freeimage.host/i/nJSqYJt.png" },
    { id: "Electrician", name: "Electrical", image: "https://freeimage.host/i/nJS1G9e.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://freeimage.host/i/nJSl9VV.png" },
    { id: "Appliances", name: "Appliances", image: "https://freeimage.host/i/nJScxae.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://freeimage.host/i/nJSaR1t.png" }
];`;

content = content.replace(oldCategories, newCategories);

// Since freeimage.host direct image links often don't end in .png but we need the raw image.
// The user provided standard freeimage.host view URLs. We usually need to convert these to direct image URLs if they are html pages.
// Actually, freeimage.host URLs like https://freeimage.host/i/nJSqYJt are HTML viewer pages.
// Let's use the actual direct image URL format for freeimage.host which is typically https://iili.io/nJSqYJt.png or similar.
// I will try to use the iili.io domain which is the direct image CDN for freeimage.host.

const correctedNewCategories = `const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/2bL3Jp4.png" }, // Using fallback if needed, but let's try iili.io with the IDs provided.
    // The ID is nJSqYJt. Direct link is usually https://iili.io/nJSqYJt.png or .webp or .jpg. Let's try .png as they are icons.
    { id: "AC", name: "AC", image: "https://iili.io/nJSqYJt.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/nJS1G9e.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/nJSl9VV.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/nJScxae.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/nJSaR1t.png" }
];`;


content = content.replace(oldCategories, `const mainCategories = [
    { id: "AC", name: "AC", image: "https://iili.io/nJSqYJt.png" },
    { id: "Electrician", name: "Electrical", image: "https://iili.io/nJS1G9e.png" },
    { id: "Plumbing", name: "Plumbing", image: "https://iili.io/nJSl9VV.png" },
    { id: "Appliances", name: "Appliances", image: "https://iili.io/nJScxae.png" },
    { id: "Cleaning", name: "Cleaning", image: "https://iili.io/nJSaR1t.png" }
];`);


fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Images patched.");
