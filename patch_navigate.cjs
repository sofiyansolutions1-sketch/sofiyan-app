const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const pathParts = window\.location\.pathname\.split\('\/'\)\.filter\(Boolean\);\s*if \(pathParts\.length > 0 && CITY_DATA\.some\(c => c\.name\.toLowerCase\(\) === pathParts\[0\]\.toLowerCase\(\)\)\) \{\s*pathParts\[0\] = newCity\.toLowerCase\(\);\s*window\.history\.replaceState\(\{\}, '', '\/' \+ pathParts\.join\('\/'\)\);\s*\} else if \(window\.location\.pathname === '\/'\) \{\s*window\.history\.replaceState\(\{\}, '', '\/' \+ newCity\.toLowerCase\(\)\);\s*\}/m;

const replacement = `const pathParts = window.location.pathname.split('/').filter(Boolean);
                          if (pathParts.length > 0 && CITY_DATA.some(c => c.name.toLowerCase() === pathParts[0].toLowerCase())) {
                              pathParts[0] = newCity.toLowerCase();
                              navigate('/' + pathParts.join('/'), { replace: true });
                          } else if (window.location.pathname === '/') {
                              navigate('/' + newCity.toLowerCase(), { replace: true });
                          }`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched CustomerPanel navigate");
} else {
    console.log("Regex not found for navigate");
}
