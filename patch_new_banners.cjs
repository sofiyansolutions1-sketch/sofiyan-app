const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldPromosArrayRegex = /const basePromos = \[\s*\{\s*src: "https:\/\/iili\.io\/[a-zA-Z0-9_\-]+\.(png|jpg)", category: ".*?"\s*\},\s*[\s\S]*?\];/;

const newPromosArray = `const basePromos = [
    { src: "https://iili.io/nddEUI2.png", category: "AC" },
    { src: "https://iili.io/nddM2M7.png", category: "Plumbing" },
    { src: "https://iili.io/nddMsOx.png", category: "WashingMachine" },
    { src: "https://iili.io/nddVrLN.png", category: "WaterPurifier" },
    { src: "https://iili.io/nddWaQp.png", category: "Geyser" },
    { src: "https://iili.io/nddXfcX.png", category: "Chimney" },
    { src: "https://iili.io/nddXvxR.png", category: "Cleaning" }
  ];`;

content = content.replace(oldPromosArrayRegex, newPromosArray);

// Check if regex matched
if (content.includes("nddEUI2")) {
    console.log("Successfully replaced banners array.");
} else {
    console.log("Failed to replace banners array. Trying string replace.");
    
    // Fallback string replacement
    const oldPromosArrayStr = `const basePromos = [
    { src: "https://iili.io/nJFbLkx.png", category: "AC" }, // Was opening cleaning
    { src: "https://iili.io/nJFpFcu.png", category: "Plumbing" }, // Guessing
    { src: "https://iili.io/nJFbxOQ.png", category: "Geyser" }, // Guessing
    { src: "https://iili.io/nJFp4Hb.png", category: "WaterPurifier" },
    { src: "https://iili.io/nJFyBgn.png", category: "WashingMachine" }
  ];`;
    
    content = content.replace(oldPromosArrayStr, newPromosArray);
}

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Done");
