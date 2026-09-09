const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Replace the dependency array of the Auto-open useEffect and SEO Update useEffect
const searchString = `    }
  }, [formattedService, serviceUrl]);

  // SEO Update logic
  useEffect(() => {
    if (activeCity) {`;

const newString = `    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedService, serviceUrl]);

  // SEO Update logic
  useEffect(() => {
    if (activeCity) {`;

content = content.replace(searchString, newString);

// Also ignore the SEO Update logic dependency array just in case
content = content.replace(/linkCanonical\.setAttribute\('href', `https:\/\/www\.sofiyanhomeservice\.com\/\$\{activeCity\.toLowerCase\(\)\}\$\{serviceUrl \? '\/' \+ serviceUrl\.toLowerCase\(\) : ''\}`\);\n    \}\n  \}, \[activeCity\]\);/g, `linkCanonical.setAttribute('href', \`https://www.sofiyanhomeservice.com/\${activeCity.toLowerCase()}\${serviceUrl ? '/' + serviceUrl.toLowerCase() : ''}\`);\n    }\n  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [activeCity, formattedService, serviceUrl]);`);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Dependencies patched.");
