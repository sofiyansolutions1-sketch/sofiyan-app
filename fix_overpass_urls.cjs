const fs = require('fs');
const file = 'components/MapRadiusSelector.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(overpassQuery.trim()),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const textRes2 = await res.text();`;

const replacement = `      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.openstreetmap.ru/api/interpreter'
      ];
      
      let textRes2 = '';
      let fetchSuccess = false;
      
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            body: 'data=' + encodeURIComponent(overpassQuery.trim()),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
          if (res.ok) {
            textRes2 = await res.text();
            
            // Basic validation to see if it's an HTML error page from overpass
            if (!textRes2.includes('OSM3S Response') || !textRes2.includes('runtime error')) {
              fetchSuccess = true;
              break;
            }
          }
        } catch (e) {
          console.warn("Overpass endpoint failed:", endpoint, e);
        }
      }
      
      if (!fetchSuccess) {
        throw new Error("All Overpass endpoints failed or returned errors.");
      }`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
console.log('done fixing overpass URLs');
