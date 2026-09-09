const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const regexCityUrl = /if \(supportedCity\) \{\s*\/\/ Silently update to the correct supported city\s*newCity = detectedCity;\s*localStorage\.setItem\('preferredCity', newCity\);\s*window\.dispatchEvent\(new Event\('cityUpdated'\)\);\s*\}/m;
const replacementCityUrl = `if (supportedCity) {
                          // Silently update to the correct supported city
                          newCity = detectedCity;
                          localStorage.setItem('preferredCity', newCity);
                          window.dispatchEvent(new Event('cityUpdated'));
                          
                          // Fix URL conflict so Layout.tsx doesn't revert the city!
                          const pathParts = window.location.pathname.split('/').filter(Boolean);
                          if (pathParts.length > 0 && CITY_DATA.some(c => c.name.toLowerCase() === pathParts[0].toLowerCase())) {
                              pathParts[0] = newCity.toLowerCase();
                              window.history.replaceState({}, '', '/' + pathParts.join('/'));
                          } else if (window.location.pathname === '/') {
                              window.history.replaceState({}, '', '/' + newCity.toLowerCase());
                          }
                      }`;

if (regexCityUrl.test(content)) {
    content = content.replace(regexCityUrl, replacementCityUrl);
    fs.writeFileSync(path, content);
    console.log("Patched CustomerPanel URL sync");
} else {
    console.log("Regex not found for URL sync");
}
