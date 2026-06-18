const fs = require('fs');

function fixNewlines(filePath) {
    let text = fs.readFileSync(filePath, 'utf8');
    text = text.replace(/\\n\\n/g, '\n\n');
    fs.writeFileSync(filePath, text);
    console.log("Fixed " + filePath);
}

fixNewlines('index.html');
fixNewlines('pages/CustomerPanel.tsx');
