const fs = require('fs');
const path = 'App.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /useEffect\(\(\) => \{\n\s*\/\/ Auto-detect removed as per user request\. Location will only be requested on explicit user action\.\n\s*\}, \[\]\);/m;

const replacement = `useEffect(() => {
    // Request permission on load as per user request
    if (navigator.geolocation && !sessionStorage.getItem('location_prompted')) {
      sessionStorage.setItem('location_prompted', 'true');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sessionStorage.setItem('userLocation', \`\${pos.coords.latitude},\${pos.coords.longitude}\`);
        },
        (err) => console.log('Location permission denied or timeout', err),
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched App.tsx for location prompt");
} else {
    console.log("Regex not found in App.tsx for location prompt");
}
