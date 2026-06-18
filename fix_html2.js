import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf-8');
const fixedContent = content.replace('<script type="module" src="/src/main.tsx"></script>', '<script type="module" src="/index.tsx"></script>');
fs.writeFileSync('index.html', fixedContent);
console.log('Fixed main.tsx to index.tsx!');
