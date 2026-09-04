const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Add state for currentCity
const stateMarker = "const [searchQuery, setSearchQuery] = useState('');";
if (content.includes(stateMarker) && !content.includes("const [currentCity,")) {
  content = content.replace(stateMarker, stateMarker + `\n  const [currentCity, setCurrentCity] = useState(localStorage.getItem('preferredCity') || 'Bangalore');\n  useEffect(() => {\n    const handleCityUpdate = () => setCurrentCity(localStorage.getItem('preferredCity') || 'Bangalore');\n    window.addEventListener('cityUpdated', handleCityUpdate);\n    return () => window.removeEventListener('cityUpdated', handleCityUpdate);\n  }, []);`);
}

// Replace localStorage.getItem with currentCity
content = content.replace(/localStorage\.getItem\('preferredCity'\) \|\| 'Bangalore'/g, 'currentCity');
content = content.replace(/localStorage\.getItem\('preferredCity'\) \|\| 'bangalore'/g, 'currentCity');

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Made Quick Links reactive.");
