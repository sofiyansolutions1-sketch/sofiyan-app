const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const regex = /const handleTrackLocation = async \(\) => \{[\s\S]*?const handleConfirmMapLocation = async \(lat: number, lng: number\) => \{[\s\S]*?setIsTrackingLocation\(false\);\n  \};/m;

const replacement = `const handleTrackLocation = async () => {
    if (!navigator.geolocation) {
      alert("Location tracking is not supported by your browser.");
      return;
    }
    
    try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'denied') {
            alert("Location access is currently blocked. Please tap the lock icon in your address bar and allow location access.");
            return;
        }
    } catch {
        console.warn("Permissions API not supported, continuing to native request");
    }

    setIsTrackingLocation(true);
    
    const fallbackTimeout = setTimeout(() => {
        setIsTrackingLocation(false);
        alert("Location request timed out. Please check your signal or enter address manually.");
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(fallbackTimeout);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await handleConfirmMapLocation(lat, lng);
      },
      (error) => {
        clearTimeout(fallbackTimeout);
        console.error("Error getting location:", error);
        setIsTrackingLocation(false);
        let errorMessage = "Unable to fetch exact location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission was denied. Please allow location access in your browser settings to use Auto-detect.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check if your device's GPS is enabled.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again in a moment.";
            break;
        }
        alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 }
    );
  };

  const handleConfirmMapLocation = async (lat: number, lng: number) => {
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

          if (newPincode && newPincode.length === 6) {
              const areaRes = await fetchAreasByPincode(newPincode);
              if (areaRes.success && areaRes.areas.length > 0) {
                  newArea = areaRes.areas[0];
                  if (areaRes.isBangalore) {
                      newCity = 'Bangalore';
                  } else if (newPincode.startsWith('110')) {
                      newCity = 'Delhi';
                  }
              }
          } else if (addr.suburb || addr.neighbourhood || addr.residential) {
              const areaName = addr.suburb || addr.neighbourhood || addr.residential;
              newArea = areaName;
              const pins = await fetchPincodesByArea([areaName]);
              if (pins && pins.length > 0) {
                  newPincode = pins[0];
                  if (newPincode.startsWith('560')) newCity = 'Bangalore';
                  else if (newPincode.startsWith('110')) newCity = 'Delhi';
              }
          }
       }
    } catch (err) {
       console.warn("Reverse geocoding failed", err);
    }

    setFormData(prev => ({
      ...prev,
      lat,
      lng,
      locationLink: googleMapsLink,
      pincode: newPincode || prev.pincode,
      area: newArea || prev.area,
      city: newCity || prev.city,
      address: newAddress || prev.address
    }));
    setIsTrackingLocation(false);
  };`;

content = content.replace(regex, replacement);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
