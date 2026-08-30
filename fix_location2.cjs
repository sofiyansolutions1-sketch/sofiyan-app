const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// 1. Remove locationError state
code = code.replace(/    const \[locationError, setLocationError\] = useState<string \| null>\(null\);\n/, '');

const startMarker = '{locationError && (';
const endMarker = '                  </div>';

const startIdx = code.indexOf(startMarker);
if (startIdx !== -1) {
    const nextDivIdx = code.indexOf('<div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">', startIdx);
    
    if (nextDivIdx !== -1) {
        const chunkToReplace = code.substring(startIdx, nextDivIdx);
        
        const newChunk = `                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
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
                  </div>
`;
        code = code.substring(0, startIdx) + newChunk + code.substring(nextDivIdx);
        fs.writeFileSync('pages/PartnerPanel.tsx', code);
        console.log("Replaced using markers!");
    } else {
        console.log("End marker not found");
    }
} else {
    console.log("Start marker not found");
}

