const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldPromos = `const basePromos = [
    { src: "https://iili.io/nJFbxOQ.png", category: "Chimney" },
    { src: "https://iili.io/nJFbLkx.png", category: "Cleaning" },
    { src: "https://iili.io/nJFpFcu.png", category: "AC" },
    { src: "https://iili.io/nJFp4Hb.png", category: "WaterPurifier" },
    { src: "https://iili.io/nJFyBgn.png", category: "WashingMachine" }
  ];`;

// Let's make sure the categories match EXACTLY what's in index.html masterServicesData.
// In the screenshot, we have: AC Repair, Plumbing Service, Geyser Repair
// The available masterServicesData categories seem to be: 'AC', 'Electrician', 'Plumbing', 'Appliances', 'Cleaning'
// Actually "Geyser" or "Chimney" might just be subcategories or they might not exist as top-level keys in masterServicesData.
// What happens if category is not found? It defaults to "Electrician" in index.html!
// Wait, the user said "jab bhi user for example ac banner per click karna hai to cleaning page khulti hai".
// Ah, look at basePromos: the images are probably mismatched with the categories!

// Let's assume the banners from the screenshot are what we want: AC, Plumbing, Geyser.
// In the current basePromos:
// nJFbxOQ: ? 
// nJFbLkx: ?
// nJFpFcu: ?
// nJFp4Hb: ?
// nJFyBgn: ?

// Let's just fix the mapping.
// Let's map them all to valid top-level categories if possible.
