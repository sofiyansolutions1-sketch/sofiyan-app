const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `    try {
       const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?lat=\${lat}&lon=\${lng}&format=json\`, {
          headers: { 'User-Agent': 'sofiyan-home-service/1.0.0' }
       });
       const data = await res.json();
       
       if (data && data.address) {
          const addr = data.address;
          
          if (data.display_name) {
              newAddress = data.display_name;
          }

          if (addr.postcode) {
              newPincode = addr.postcode;
          } else {
              const match = (data.display_name || '').match(/\\b\\d{6}\\b/);
              if (match) newPincode = match[0];
          }

          let detectedCity = addr.city || addr.state_district || addr.town || addr.municipality || "";
          if (newPincode && newPincode.startsWith('560')) detectedCity = 'Bangalore';
          else if (newPincode && newPincode.startsWith('110')) detectedCity = 'Delhi';

          const lowerCity = detectedCity.toLowerCase();
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
                  } else {
                      newCity = detectedCity;
                  }
              }
          }
       }
    } catch (error) {
       console.error("Geocoding failed:", error);
    }`;

const newCode = `    try {
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
    } catch (error) {
       console.error("Geocoding failed:", error);
    }`;

// Replace ignoring exact whitespace
const escapedOld = oldCode.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&').replace(/\\s+/g, '\\s*');
const regex = new RegExp(escapedOld, 'm');

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync(path, content);
    console.log("Patched CustomerPanel geocode");
} else {
    console.log("Regex not found for geocode");
}
