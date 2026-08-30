const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const regex = /<div className="animate-in fade-in duration-300">\s*<label className="block text-\[11px\] font-bold text-slate-500 mb-2 mt-6 tracking-wide">LOCATION DETAILS<\/label>[\s\S]*?<div className="flex gap-4 pt-8">/m;

const replacement = `<div className="animate-in fade-in duration-300">
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 mt-6 tracking-wide">SERVICE DELIVERY AREAS</label>
                  <p className="text-sm text-slate-500 mb-4">Choose your area, select the radius, and we will find all pincodes within that range.</p>
                  
                  {locationError && (
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
                  </div>
                  
                  <div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                    <h4 className="text-[11px] font-bold text-slate-800 mb-3 tracking-wide">LOCATION DETAILS</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Address / Landmark *</label>
                      <textarea placeholder="e.g. 123 Main Street, Near Park" value={regData.address} onChange={(e) => setRegData({...regData, address: e.target.value})} className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none" rows={2} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">City *</label>
                        <input type="text" placeholder="e.g. Bangalore" value={regData.city} readOnly className="w-full border border-slate-200 bg-slate-100 text-slate-600 p-3 rounded-xl outline-none text-sm cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Area / Locality *</label>
                        <input type="text" placeholder="e.g. Andheri East" value={regData.area} onChange={(e) => setRegData({...regData, area: e.target.value})} className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Pincode *</label>
                        <input type="text" placeholder="e.g. 560001" value={regData.pincode || ''} onChange={(e) => setRegData({...regData, pincode: e.target.value})} className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                      </div>
                    </div>
                  </div>
                  
                  {regData.service_pincodes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-[11px] font-bold text-slate-500 mb-3 tracking-wide">SELECTED PINCODES ({regData.service_pincodes.length})</h4>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border border-slate-200 rounded-xl bg-white shadow-inner">
                        {regData.service_pincodes.map(pin => (
                          <span key={pin} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                            {pin}
                            <button onClick={() => setRegData({...regData, service_pincodes: regData.service_pincodes.filter(p => p !== pin)})} className="text-indigo-400 hover:text-red-500 transition-colors">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 pt-8">`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('pages/PartnerPanel.tsx', code);
    console.log("Replaced successfully!");
} else {
    console.log("Regex did not match.");
}
