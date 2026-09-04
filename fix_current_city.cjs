const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

content = content.replace(
  "const [currentCity, setCurrentCity] = useState(currentCity);",
  "const [currentCity, setCurrentCity] = useState(localStorage.getItem('preferredCity') || 'Bangalore');"
);

content = content.replace(
  "const handleCityUpdate = () => setCurrentCity(currentCity);",
  "const handleCityUpdate = () => setCurrentCity(localStorage.getItem('preferredCity') || 'Bangalore');"
);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
