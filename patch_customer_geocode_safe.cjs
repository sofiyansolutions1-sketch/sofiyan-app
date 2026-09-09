const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCodeStart = "const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {";
const oldCodeEnd = "console.warn(\"Reverse geocoding failed\", err);\n    }";

const startIndex = content.indexOf(oldCodeStart);
if (startIndex !== -1) {
    // Find the end index
    const endIndex = content.indexOf(oldCodeEnd, startIndex);
    if (endIndex !== -1) {
        const fullOldCode = content.substring(startIndex - 13, endIndex + oldCodeEnd.length); // back up to 'try {'
        
        const newCode = `try {
       const res = await fetch(\`/api/geocode?lat=\${lat}&lng=\${lng}\`);
       const data = await res.json();
       
       if (data.error) {
           alert(data.error);
           throw new Error(data.error);
       }
       
       if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          newAddress = result.formatted_address || '';
          
          let detectedCity = '';
          
          for (const component of result.address_components) {
              if (component.types.includes('postal_code')) {
                  newPincode = component.long_name;
              }
              if (component.types.includes('locality')) {
                  detectedCity = component.long_name;
              } else if (!detectedCity && component.types.includes('administrative_area_level_2')) {
                  detectedCity = component.long_name;
              }
              if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
                  newArea = component.long_name;
              }
          }

          if (!newPincode) {
              const match = (newAddress || '').match(/\\b\\d{6}\\b/);
              if (match) newPincode = match[0];
          }

          if (newPincode && newPincode.startsWith('560')) detectedCity = 'Bangalore';
          else if (newPincode && newPincode.startsWith('110')) detectedCity = 'Delhi';

          const lowerCity = (detectedCity || '').toLowerCase();
          if (lowerCity.includes('bengaluru')) detectedCity = 'Bangalore';
          if (lowerCity.includes('gurugram')) detectedCity = 'Gurgaon';
          if (lowerCity.includes('gautam buddha') || lowerCity.includes('noida')) detectedCity = 'Noida';
          if (lowerCity.includes('bombay')) detectedCity = 'Mumbai';
          if (lowerCity.includes('madras')) detectedCity = 'Chennai';
          if (lowerCity.includes('calcutta')) detectedCity = 'Kolkata';
          if (lowerCity.includes('banaras') || lowerCity.includes('kashi')) detectedCity = 'Varanasi';

          if (detectedCity) {
              const supportedCity = CITY_DATA.find(c => 
                  c.name.toLowerCase() === detectedCity.toLowerCase()
              );
              
              if (supportedCity) {
                  newCity = supportedCity.name;
                  
                  if (newCity !== formData.city) {
                      localStorage.setItem('preferredCity', newCity);
                      window.dispatchEvent(new Event('cityUpdated'));
                      
                      const pathParts = window.location.pathname.split('/').filter(Boolean);
                      if (pathParts.length > 0 && CITY_DATA.some(c => c.name.toLowerCase() === pathParts[0].toLowerCase())) {
                          pathParts[0] = newCity.toLowerCase();
                          navigate('/' + pathParts.join('/'), { replace: true });
                      } else if (window.location.pathname === '/') {
                          navigate('/' + newCity.toLowerCase(), { replace: true });
                      }
                  }
              } else {
                  newCity = detectedCity;
              }
          }
       }
    } catch (err) {
       console.warn("Geocoding failed:", err);
    }`;

        content = content.replace(fullOldCode, newCode);
        fs.writeFileSync(path, content);
        console.log("Patched CustomerPanel geocode SAFELY");
    } else {
        console.log("End marker not found");
    }
} else {
    console.log("Start marker not found");
}
