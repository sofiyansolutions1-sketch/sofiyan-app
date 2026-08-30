const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const errorInjectionTarget = `<div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <MapRadiusSelector`;

const errorInjectionReplace = `{locationError && (
                     <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 mb-4 text-left shadow-sm flex items-start gap-3">
                       <div className="bg-red-100 p-1.5 rounded-full mt-0.5"><MapPin size={16} /></div>
                       <div><span className="font-bold">Location Mismatch:</span> {locationError}</div>
                     </div>
                  )}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <MapRadiusSelector`;

content = content.replace(errorInjectionTarget, errorInjectionReplace);

const inputSplitTarget = `<div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Area / City *</label>
                        <input type="text" placeholder="e.g. Bangalore" value={regData.city} onChange={(e) => setRegData({...regData, city: e.target.value})} className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Area Pincode *</label>
                        <input type="text" placeholder="e.g. 560001" value={regData.pincode || ''} onChange={(e) => setRegData({...regData, pincode: e.target.value})} className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                      </div>
                    </div>`;

const inputSplitReplace = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    </div>`;

content = content.replace(inputSplitTarget, inputSplitReplace);
fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Replaced split inputs and location error");
