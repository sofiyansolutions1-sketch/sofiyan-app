const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const targetStart = '{locationError && (';
const targetEnd = ')}                </div>              )}            </div>';

// Find the index of the start string
const startIndex = content.indexOf(targetStart);
// We actually want to replace everything from `<label className="block text-[11px] font-bold text-slate-500 mb-2 mt-6 tracking-wide">SERVICE DELIVERY AREAS</label>`
const realTargetStart = `<label className="block text-[11px] font-bold text-slate-500 mb-2 mt-6 tracking-wide">SERVICE DELIVERY AREAS</label>`;
const realStartIndex = content.indexOf(realTargetStart);

// Let's find the closing of `{regData.city && (`
const endStr = `</div>              )}            </div>`;
const realEndIndex = content.indexOf(endStr, realStartIndex) + `</div>              )}`.length; // Stop before `</div>`

const sectionToReplace = content.substring(realStartIndex, realEndIndex);

const replacement = `<label className="block text-[11px] font-bold text-slate-500 mb-2 mt-6 tracking-wide">LOCATION DETAILS</label>
                  <p className="text-sm text-slate-500 mb-4">Click below to automatically fill your area, pincode, and address.</p>
                  
                  <button 
                    onClick={() => {
                        if (!navigator.geolocation) {
                          alert("Location tracking is not supported by your browser.");
                          return;
                        }
                        
                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            try {
                                const lat = position.coords.latitude;
                                const lng = position.coords.longitude;
                                const geoRes = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`);
                                const geoData = await geoRes.json();
                                
                                if (geoData && geoData.address) {
                                  let detectedPincode = geoData.address.postcode || '';
                                  const match = detectedPincode.match(/\\b\\d{6}\\b/);
                                  if (match) detectedPincode = match[0];
                                  
                                  const detectedArea = geoData.address.suburb || geoData.address.neighbourhood || geoData.address.residential || geoData.address.city_district || geoData.address.county || '';
                                  const detectedAddress = geoData.display_name || '';
                                  
                                  setRegData(prev => ({
                                      ...prev,
                                      lat,
                                      lng,
                                      area: detectedArea || prev.area,
                                      pincode: detectedPincode || prev.pincode,
                                      address: detectedAddress || prev.address
                                      // Note: we intentionally do NOT overwrite prev.city here
                                  }));
                                }
                            } catch (err) {
                                console.warn(err);
                                alert("Failed to fetch address from location.");
                            }
                          },
                          (err) => {
                            alert("Unable to fetch location. Please ensure location permissions are granted.");
                          }
                        );
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm mb-6"
                  >
                    <Navigation className="w-5 h-5" />
                    Use Current Location
                  </button>

                  <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
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
                </div>              )}`;

fs.writeFileSync('pages/PartnerPanel.tsx', content.replace(sectionToReplace, replacement));
console.log("Replaced UI successfully");
