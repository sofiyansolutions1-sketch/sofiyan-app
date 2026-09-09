const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Remove the unused eslint-disable directives and fix dependencies properly
content = content.replace(/\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n  \}, \[formattedService, serviceUrl\]\);/g, '  }, [formattedService, serviceUrl, selectedService]);');

content = content.replace(/\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n  \}, \[activeCity, formattedService, serviceUrl\]\);/g, '  }, [activeCity, formattedService, serviceUrl]);');

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Dependencies fixed properly.");
