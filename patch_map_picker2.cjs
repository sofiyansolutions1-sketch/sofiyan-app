const fs = require('fs');
let content = fs.readFileSync('components/MapPicker.tsx', 'utf8');

const regex = /if \\(initialLat && initialLng\\) \\{\\s*setPosition\\(\\[initialLat, initialLng\\]\\);\\s*\\} else \\{/;
const replacement = `if (initialLat && initialLng) {
           if (!position || position[0] !== initialLat || position[1] !== initialLng) {
               setPosition([initialLat, initialLng]);
           }
       } else {`;

content = content.replace(/if \(initialLat && initialLng\) \{\s*setPosition\(\[initialLat, initialLng\]\);\s*\} else \{/, replacement);

fs.writeFileSync('components/MapPicker.tsx', content);
