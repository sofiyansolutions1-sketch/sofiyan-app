const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// 1. Remove locationError state
code = code.replace(/    const \[locationError, setLocationError\] = useState<string \| null>\(null\);\n/, '');

// 2. Fix the component part
const oldChunk = `                  {locationError && (
                     <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 mb-4 text-left shadow-sm flex items-start gap-3">
                       <div className="bg-red-100 p-1.5 rounded-full mt-0.5"><MapPin size={16} /></div>
                       <div><span className="font-bold">Location Mismatch:</span> {locationError}</div>
                     </div>
                  )}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <MapRadiusSelector 
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
                    />
                  </div>`;

const newChunk = `                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <MapRadiusSelector 
                      onLocationDetected={(lat, lng, addressDetails) => {
                        setRegData(prev => ({
                          ...prev,
                          lat: lat,
                          lng: lng,
                          area: addressDetails?.area || prev.area,
                          address: addressDetails?.address || prev.address,
                          pincode: addressDetails?.pincode || prev.pincode
                        }));
                      }}
                      onPincodesFound={(pins, lat, lng, radius, addressDetails) => {
                        setRegData(prev => ({
                            ...prev, 
                            service_pincodes: Array.from(new Set([...prev.service_pincodes, ...pins])),
                            lat: lat || prev.lat,
                            lng: lng || prev.lng,
                            service_radius: radius || prev.service_radius,
                            area: addressDetails?.area || prev.area,
                            address: addressDetails?.address || prev.address,
                            pincode: addressDetails?.pincode || prev.pincode,
                        }));
                      }}
                    />
                  </div>`;

if (code.includes(oldChunk)) {
  code = code.replace(oldChunk, newChunk);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log("Location fix applied!");
} else {
  console.log("Could not find the chunk to replace.");
}
