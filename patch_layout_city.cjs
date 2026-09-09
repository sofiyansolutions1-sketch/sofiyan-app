const fs = require('fs');
let content = fs.readFileSync('components/Layout.tsx', 'utf8');

const targetLogic = `    // Check if we are currently on the customer panel (not admin/partner)
    if (location.pathname === '/' || CITY_DATA.some(c => \`/\${c.name.toLowerCase()}\` === location.pathname.toLowerCase())) {
      navigate(\`/\${cityName.toLowerCase()}\`);
    }`;

const newLogic = `    // Check if we are on a city-specific page and update URL
    const pathParts = location.pathname.split('/').filter(Boolean);
    const isCityInPath = pathParts.length > 0 && CITY_DATA.some(c => c.name.toLowerCase() === pathParts[0].toLowerCase());
    
    if (location.pathname === '/') {
      navigate(\`/\${cityName.toLowerCase()}\`);
    } else if (isCityInPath) {
      // Replace the old city with the new city in the URL
      pathParts[0] = cityName.toLowerCase();
      navigate('/' + pathParts.join('/'));
    }`;

if (content.includes(targetLogic)) {
  content = content.replace(targetLogic, newLogic);
  fs.writeFileSync('components/Layout.tsx', content);
  console.log("Layout.tsx patched with dynamic city navigation");
} else {
  console.log("Target logic not found in Layout.tsx");
}
