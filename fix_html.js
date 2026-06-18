import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf-8');
const fixedContent = content + '`;\n              document.body.appendChild(seoDiv);\n          }\n      };\n    </script>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n';
fs.writeFileSync('index.html', fixedContent);
console.log('Fixed index.html!');
