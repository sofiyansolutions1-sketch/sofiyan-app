const fs = require('fs');
const path = 'App.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /useEffect\(\(\) => \{\n\s*if \(sessionStorage\.getItem\('city_auto_detected'\)\) return;\s*if \(navigator\.geolocation\) \{[\s\S]*?\{ timeout: 10000, maximumAge: 60000 \}\n\s*\);\n\s*\}\n\s*\}, \[\]\);/m;

const replacement = `useEffect(() => {
    // Auto-detect removed as per user request. Location will only be requested on explicit user action.
  }, []);`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched App.tsx auto-detect");
} else {
    console.log("Regex not found in App.tsx for auto-detect");
}
