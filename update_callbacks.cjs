const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const target = `<MapRadiusSelector 
                      onLocationDetected={(lat, lng, addressDetails) => {
                        setRegData(prev => ({
                          ...prev,
                          lat: lat,
                          lng: lng,
                          city: addressDetails?.city || prev.city,
                          address: addressDetails?.address || prev.address,
                          pincode: addressDetails?.pincode || prev.pincode
                        }));
                      }}
                      onPincodesFound={(pins, lat, lng, radius, addressDetails) => {
                        setRegData({
                            ...regData, 
                            service_pincodes: Array.from(new Set([...regData.service_pincodes, ...pins])),
                            lat: lat || regData.lat,
                            lng: lng || regData.lng,
                            service_radius: radius || regData.service_radius,
                            city: addressDetails?.city || regData.city,
                            address: addressDetails?.address || regData.address,
                            pincode: addressDetails?.pincode || regData.pincode,
                            aadharNumber: regData.aadharNumber
                        });
                      }}
                     />`;

const replacement = `<MapRadiusSelector 
                      onLocationDetected={(lat, lng, addressDetails) => {
                        if (addressDetails?.city && regData.city) {
                           const detectedLower = addressDetails.city.toLowerCase();
                           const selectedLower = regData.city.toLowerCase();
                           if (!detectedLower.includes(selectedLower) && !selectedLower.includes(detectedLower)) {
                               setLocationError(\`Your current location indicates you are in \${addressDetails.city} area, but you selected \${regData.city}. Please select \${addressDetails.city} instead.\`);
                           } else {
                               setLocationError(null);
                           }
                        }
                        setRegData(prev => ({
                          ...prev,
                          lat: lat,
                          lng: lng,
                          city: addressDetails?.city || prev.city,
                          area: addressDetails?.area || prev.area,
                          address: addressDetails?.address || prev.address,
                          pincode: addressDetails?.pincode || prev.pincode
                        }));
                      }}
                      onPincodesFound={(pins, lat, lng, radius, addressDetails) => {
                        if (addressDetails?.city && regData.city) {
                           const detectedLower = addressDetails.city.toLowerCase();
                           const selectedLower = regData.city.toLowerCase();
                           if (!detectedLower.includes(selectedLower) && !selectedLower.includes(detectedLower)) {
                               setLocationError(\`Your current location indicates you are in \${addressDetails.city} area, but you selected \${regData.city}. Please select \${addressDetails.city} instead.\`);
                           } else {
                               setLocationError(null);
                           }
                        }
                        setRegData({
                            ...regData, 
                            service_pincodes: Array.from(new Set([...regData.service_pincodes, ...pins])),
                            lat: lat || regData.lat,
                            lng: lng || regData.lng,
                            service_radius: radius || regData.service_radius,
                            city: addressDetails?.city || regData.city,
                            area: addressDetails?.area || regData.area,
                            address: addressDetails?.address || regData.address,
                            pincode: addressDetails?.pincode || regData.pincode,
                            aadharNumber: regData.aadharNumber
                        });
                      }}
                     />`;

if (content.includes(target)) {
    fs.writeFileSync('pages/PartnerPanel.tsx', content.replace(target, replacement));
    console.log("Success");
} else {
    // Try relaxing whitespace if exact match fails
    const regex = /<MapRadiusSelector\s*onLocationDetected=\{[\s\S]*?\}\s*onPincodesFound=\{[\s\S]*?\}\s*\/>/;
    if(regex.test(content)) {
        fs.writeFileSync('pages/PartnerPanel.tsx', content.replace(regex, replacement));
        console.log("Success with Regex");
    } else {
        console.log("Failed to find target");
    }
}
