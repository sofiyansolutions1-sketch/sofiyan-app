const fs = require('fs');
const path = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const handleConfirmMapLocation = async \(lat: number, lng: number\) => \{[\s\S]*?setIsTrackingLocation\(false\);\n\s*\};/m;

const replacement = `const handleConfirmMapLocation = async (lat: number, lng: number) => {
    setIsMapPickerOpen(false);
    setIsTrackingLocation(true);
    
    const googleMapsLink = \`https://www.google.com/maps?q=\${lat},\${lng}\`;
    
    let newPincode = formData.pincode;
    let newArea = formData.area;
    let newCity = formData.city;
    let newAddress = formData.address;

    try {
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
                  detectedCity.toLowerCase().includes(c.name.toLowerCase()) || 
                  c.name.toLowerCase().includes(detectedCity.toLowerCase())
              );
              
              if (supportedCity) {
                  detectedCity = supportedCity.name;
              }

              if (newCity) {
                  const normalizedDetected = detectedCity.toLowerCase();
                  const normalizedSelected = newCity.toLowerCase();
                  
                  if (!normalizedDetected.includes(normalizedSelected) && !normalizedSelected.includes(normalizedDetected)) {
                      if (supportedCity) {
                          newCity = detectedCity;
                          localStorage.setItem('preferredCity', newCity);
                          window.dispatchEvent(new Event('cityUpdated'));
                          
                          const pathParts = window.location.pathname.split('/').filter(Boolean);
                          if (pathParts.length > 0 && CITY_DATA.some(c => c.name.toLowerCase() === pathParts[0].toLowerCase())) {
                              pathParts[0] = newCity.toLowerCase();
                              window.history.replaceState({}, '', '/' + pathParts.join('/'));
                          } else if (window.location.pathname === '/') {
                              window.history.replaceState({}, '', '/' + newCity.toLowerCase());
                          }
                      } else {
                          newCity = detectedCity;
                      }
                  }
              } else {
                  newCity = detectedCity;
              }
          }

          if (newPincode && newPincode.length === 6) {
              try {
                  const areaRes = await fetchAreasByPincode(newPincode);
                  if (areaRes.success && areaRes.areas.length > 0) {
                      newArea = areaRes.areas[0];
                  } else {
                      newArea = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || "";
                  }
              } catch (e) {
                  newArea = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || "";
              }
          } else if (addr.suburb || addr.neighbourhood || addr.residential) {
              const areaName = addr.suburb || addr.neighbourhood || addr.residential;
              newArea = areaName;
              try {
                  const pins = await fetchPincodesByArea([areaName]);
                  if (pins && pins.length > 0) {
                      newPincode = pins[0];
                  }
              } catch (e) {}
          }
       }
    } catch (err) {
       console.warn("Reverse geocoding failed", err);
    }
    
    // Explicitly sync to form data and immediately update the form to prevent overwriting
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
  };`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
    console.log("Patched handleConfirmMapLocation completely");
} else {
    console.log("Regex not found for handleConfirmMapLocation");
}
