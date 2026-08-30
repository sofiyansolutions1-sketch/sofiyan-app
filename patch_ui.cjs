const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldVerifyUI = `            {regStep === 'verify' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="text-amber-600 mt-0.5 shrink-0" size={20} />
                    <p className="text-sm text-amber-800">For security and trust, we need to verify your identity. Your details are kept strictly confidential.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Aadhar Number *</label>
                    <input type="text" placeholder="XXXX XXXX XXXX" value={regData.aadharNumber} onChange={(e) => setRegData({...regData, aadharNumber: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono tracking-wider" />
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                  <button onClick={() => setRegStep('location')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>
                  <button onClick={handleRegistrationSubmit} disabled={regData.aadharNumber.length < 12} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50">Submit Application</button>
                </div>
              </div>
            )}`;

const newVerifyUI = `            {regStep === 'verify' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
                {/* 1. Profile Photo */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">1. Take Your Profile Photo *</h4>
                    <p className="text-xs text-slate-500 mt-1">This will be shown to customers when you are assigned to a job.</p>
                  </div>
                  
                  {profilePhoto ? (
                    <div className="relative inline-block">
                      <img src={URL.createObjectURL(profilePhoto)} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100" />
                      <button onClick={() => setProfilePhoto(null)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition">
                        <Trash2 size={14} />
                      </button>
                      <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-600 p-1 rounded-full"><CheckCircle size={16} /></div>
                    </div>
                  ) : (
                    <button onClick={startCamera} className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2">
                      <Camera size={20} /> Take Profile Photo
                    </button>
                  )}
                </div>

                {/* 2. Business Verification */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">2. Business Verification</h4>
                    <p className="text-xs text-slate-500 mt-1">Upload Shop, Banner, Pamphlet, or Visiting Card photos.</p>
                  </div>
                  
                  {businessPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {businessPhotos.map((photo, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(photo)} alt={\`Business \${i}\`} className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
                          <button onClick={() => setBusinessPhotos(businessPhotos.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <label className="flex-1 py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2 cursor-pointer">
                      <Camera size={18} /> Camera
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { if (e.target.files?.[0]) setBusinessPhotos([...businessPhotos, e.target.files[0]]) }} />
                    </label>
                    <label className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer">
                      <ImageIcon size={18} /> Gallery
                      <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setBusinessPhotos([...businessPhotos, e.target.files[0]]) }} />
                    </label>
                  </div>
                </div>

                {/* 3. Aadhaar Verification */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">3. Aadhaar Verification *</h4>
                    <p className="text-xs text-slate-500 mt-1">Provide your Aadhaar number or upload a photo of your Aadhaar card.</p>
                  </div>
                  
                  <div>
                    <input type="text" placeholder="Aadhaar Number (12 digits)" value={regData.aadharNumber} onChange={(e) => setRegData({...regData, aadharNumber: e.target.value.replace(/\\D/g, '')})} maxLength={12} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono tracking-wider text-center" />
                  </div>

                  <div className="text-center text-xs text-slate-400 font-bold uppercase">OR</div>

                  {aadhaarPhoto ? (
                    <div className="relative inline-block">
                      <img src={URL.createObjectURL(aadhaarPhoto)} alt="Aadhaar" className="w-32 h-20 rounded-xl object-cover border border-slate-200" />
                      <button onClick={() => setAadhaarPhoto(null)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition">
                        <Trash2 size={12} />
                      </button>
                      <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-600 p-1 rounded-full"><CheckCircle size={14} /></div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <label className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer text-sm">
                        <Camera size={16} /> Photo
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { if (e.target.files?.[0]) setAadhaarPhoto(e.target.files[0]) }} />
                      </label>
                      <label className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer text-sm">
                        <Upload size={16} /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setAadhaarPhoto(e.target.files[0]) }} />
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setRegStep('location')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all disabled:opacity-50" disabled={isSubmitting}>Back</button>
                  <button 
                    onClick={handleRegistrationSubmit} 
                    disabled={isSubmitting || !profilePhoto || (regData.aadharNumber.length < 12 && !aadhaarPhoto)} 
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}`;

if (code.includes(oldVerifyUI)) {
  code = code.replace(oldVerifyUI, newVerifyUI);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log("Verify UI patched!");
} else {
  console.log("Could not find Verify UI.");
}
