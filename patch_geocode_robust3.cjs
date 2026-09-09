const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCodeStart = "try {\n       const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);";
const oldCodeEnd = "setIsTrackingLocation(false);\n    }\n  };"; // Let's not rely on exact end string length, just use substring and replace

const startIndex = content.indexOf(oldCodeStart);
if (startIndex !== -1) {
    const endIndex = content.indexOf("};\n\n  useEffect(() => {\n    const fetchLatestBlogs", startIndex);
    
    if (endIndex !== -1) {
        const fullOldCode = content.substring(startIndex, endIndex);
        
        const newCode = `try {
       const res = await fetch(\`/api/geocode?lat=\${lat}&lng=\${lng}\`);
       const data = await res.json();
       
       if (data.error) {
           console.warn("Geocoding API returned an error:", data.error);
       } else if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          newAddress = result.formatted_address || '';
          
          let detectedCity = '';
          
          for (const component of result.address_components) {
              const types = component.types || [];
              if (types.includes('postal_code')) {
                  newPincode = component.long_name;
              }
              if (types.includes('locality')) {
                  detectedCity = component.long_name;
              } else if (!detectedCity && types.includes('administrative_area_level_2')) {
                  detectedCity = component.long_name;
              }
              if (types.some(t => t.includes('sublocality') || t.includes('neighborhood') || t.includes('route'))) {
                  if (!newArea) newArea = component.long_name;
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
                  detectedCity.toLowerCase().includes(c.name.toLowerCase()) ||
                  c.name.toLowerCase().includes(detectedCity.toLowerCase())
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
    } finally {
       // Explicitly sync to form data and immediately update the form
       setFormData((prev: any) => ({
         ...prev,
         lat,
         lng,
         locationLink: googleMapsLink,
         pincode: newPincode || prev.pincode || "",
         area: newArea || prev.area || "",
         city: newCity || prev.city || "",
         address: newAddress || prev.address || ""
       }));
       setIsTrackingLocation(false);
    }
  `;

        content = content.replace(fullOldCode, newCode);
        fs.writeFileSync(path, content);
        console.log("Patched CustomerPanel geocode to be robust v3");
    } else {
        console.log("End marker not found");
    }
} else {
    console.log("Start marker not found");
}
