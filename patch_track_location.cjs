const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /navigator\.geolocation\.getCurrentPosition\(\s*async \(position\) => \{[\s\S]*?clearTimeout\(fallbackTimeout\);\s*const lat = position\.coords\.latitude;\s*const lng = position\.coords\.longitude;\s*await handleConfirmMapLocation\(lat, lng\);\s*\}/m;

const replacement = `navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(fallbackTimeout);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        // If accuracy is worse than 2000 meters, it's likely an IP-based location, not GPS
        if (accuracy > 2000) {
            alert("Your browser provided an approximate location. For exact location, please ensure your device GPS/Location Services is turned on, or enter your address manually.");
        }
        
        await handleConfirmMapLocation(lat, lng);
      }`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched handleTrackLocation accuracy check");
} else {
    console.log("Regex not found for handleTrackLocation");
}
