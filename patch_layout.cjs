const fs = require('fs');
const path = 'components/Layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const handleCitySelect = \(cityName: string\) => \{[\s\S]*?navigate\('\/' \+ pathParts\.join\('\/'\)\);\s*\}\s*\};/m;

const replacement = `const handleCitySelect = (cityName: string) => {
    setUserCity(cityName);
    localStorage.setItem('preferredCity', cityName);
    
    // Check if we are on a city-specific page and update URL
    const pathParts = location.pathname.split('/').filter(Boolean);
    const isCityInPath = pathParts.length > 0 && CITY_DATA.some(c => c.name.toLowerCase() === pathParts[0].toLowerCase());
    
    if (location.pathname === '/') {
      navigate(\`/\${cityName.toLowerCase()}\`);
    } else if (isCityInPath) {
      // Replace the old city with the new city in the URL
      pathParts[0] = cityName.toLowerCase();
      navigate('/' + pathParts.join('/'));
    }
    
    // Dispatch after navigation so URL is correct
    window.dispatchEvent(new Event('cityUpdated'));
    setIsCityModalOpen(false);
  };`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched Layout.tsx handleCitySelect");
} else {
    console.log("Regex not found for Layout.tsx handleCitySelect");
}
