const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = "area: areaRes.areas[0],";
const replaceStr = "area: prev.area ? prev.area : areaRes.areas[0],";

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(path, content);
    console.log("Patched fetchAreaByPin to not overwrite existing area");
} else {
    console.log("Target string not found in CustomerPanel.tsx");
}
