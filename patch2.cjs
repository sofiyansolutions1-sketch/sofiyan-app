const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const regex = /const handleTrackLocation = \(\) => \{[\s\S]*?\{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 \}\n\s+\);\n\s+\};/;

const replacement = `const handleTrackLocation = () => {
    if (!navigator.geolocation) {
      alert("Location tracking is not supported by your browser.");
      return;
    }
    setIsTrackingLocation(true);
    
    // Fallback timeout in case OS location services are entirely disabled (browser bug)
    const fallbackTimeout = setTimeout(() => {
        setIsTrackingLocation(false);
        alert("Location detection timed out. Please ensure your device Location Services (GPS) are enabled in settings and grant permissions.");
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(fallbackTimeout);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const googleMapsLink = \`https://www.google.com/maps?q=\${lat},\${lng}\`;
        
        let newPincode = formData.pincode;
        let newArea = formData.area;
        let newCity = formData.city;
        
        try {
           const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?lat=\${lat}&lon=\${lng}&format=json\`, {
              headers: { 'User-Agent': 'sofiyan-home-service/1.0.0' }
           });
           const data = await res.json();
           
           if (data && data.address) {
              if (data.address.postcode) {
                  newPincode = data.address.postcode;
                  const areaRes = await fetchAreasByPincode(newPincode);
                  if (areaRes.success && areaRes.areas.length > 0) {
                      newArea = areaRes.areas[0];
                      if (areaRes.isBangalore) {
                          newCity = 'Bangalore';
                      } else if (newPincode.startsWith('110')) {
                          newCity = 'Delhi';
                      }
                  }
              } else {
                  // Fallback: If no postcode is returned from OSM, use suburb/neighbourhood and India Post API
                  const areaName = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.city_district;
                  if (areaName) {
                      newArea = areaName;
                      const pins = await fetchPincodesByArea([areaName]);
                      if (pins && pins.length > 0) {
                          newPincode = pins[0];
                          if (newPincode.startsWith('560')) newCity = 'Bangalore';
                          else if (newPincode.startsWith('110')) newCity = 'Delhi';
                      }
                  }
              }
           }
        } catch (e) {
           console.warn("Reverse geocoding failed", e);
        }

        setFormData(prev => ({
          ...prev,
          lat,
          lng,
          locationLink: googleMapsLink,
          pincode: newPincode || prev.pincode,
          area: newArea || prev.area,
          city: newCity || prev.city
        }));
        setIsTrackingLocation(false);
      },
      (error) => {
        clearTimeout(fallbackTimeout);
        console.error("Error getting location:", error);
        setIsTrackingLocation(false);
        alert("Unable to fetch exact location. Please ensure location permissions are granted and GPS is turned on.");
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 }
    );
  };`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('pages/CustomerPanel.tsx', code);
    console.log("Patched successfully!");
} else {
    console.log("Could not find regex match!");
}
