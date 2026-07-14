const fs = require('fs');

const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const modalStart = content.indexOf('  const renderRegistrationModal = () => (');
const modalEnd = content.indexOf('  );', modalStart) + 4;

const newModal = `  const renderRegistrationModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
        <button onClick={() => setIsRegistrationOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 font-bold">✕</button>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Partner Onboarding 👋</h2>
        <p className="text-slate-500 mb-10 text-sm">Join our network of expert professionals</p>
        
        <div className="flex justify-between items-center mb-10 relative px-2">
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-slate-100 -z-10"></div>
          
          <div className="flex flex-col items-center">
            <div className={\`w-12 h-12 rounded-full flex items-center justify-center shadow-sm \${['personal', 'expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}\`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <span className={\`text-[10px] mt-3 font-bold tracking-wider \${['personal', 'expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}\`}>PERSONAL</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={\`w-12 h-12 rounded-full flex items-center justify-center shadow-sm \${['expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}\`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <span className={\`text-[10px] mt-3 font-bold tracking-wider \${['expertise', 'location', 'verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}\`}>EXPERTISE</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={\`w-12 h-12 rounded-full flex items-center justify-center shadow-sm \${['location', 'verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}\`}>
              <MapPin className="w-5 h-5" />
            </div>
            <span className={\`text-[10px] mt-3 font-bold tracking-wider \${['location', 'verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}\`}>SERVICE AREAS</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={\`w-12 h-12 rounded-full flex items-center justify-center shadow-sm \${['verify', 'verifying', 'success'].includes(regStep) ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}\`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className={\`text-[10px] mt-3 font-bold tracking-wider \${['verify', 'verifying', 'success'].includes(regStep) ? 'text-indigo-700' : 'text-slate-400'}\`}>VERIFY</span>
          </div>
        </div>
        
        {regStep === 'personal' && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">FIRST NAME</label>
                <input type="text" placeholder="First Name" value={regData.firstName} onChange={e => setRegData({...regData, firstName: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">LAST NAME</label>
                <input type="text" placeholder="Last Name" value={regData.lastName} onChange={e => setRegData({...regData, lastName: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">AGE <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Age (Min 18)" value={regData.age} onChange={e => setRegData({...regData, age: e.target.value.replace(/\\D/g, '').slice(0, 3)})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">GENDER</label>
                <select value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">PRIMARY PHONE</label>
                <input type="text" placeholder="Mobile number" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value.replace(/\\D/g, '').slice(0, 10)})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">ALTERNATIVE PHONE (OPTIONAL)</label>
                <input type="text" placeholder="Secondary contact" value={regData.altPhone} onChange={e => setRegData({...regData, altPhone: e.target.value.replace(/\\D/g, '').slice(0, 10)})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">PASSWORD <span className="text-red-500">*</span></label>
              <input type="password" placeholder="Strong Password (Min 6 chars)" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
            </div>
            
            <button onClick={() => setRegStep('expertise')} disabled={!regData.firstName || !regData.lastName || regData.phone.length < 10 || !regData.password || regData.password.length < 6 || parseInt(regData.age) < 18} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6 shadow-md hover:shadow-lg">Continue to Expertise</button>
          </div>
        )}
        
        {regStep === 'expertise' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-3 tracking-wide">CATEGORIES OF EXPERTISE</label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICES.map(c => (
                  <label key={c.id} className={\`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all \${regData.categories.includes(c.name) ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm' : 'hover:bg-slate-50 text-slate-700 border-slate-200'}\`}>
                    <input type="checkbox" checked={regData.categories.includes(c.name)} onChange={e => {
                      const newCats = e.target.checked ? [...regData.categories, c.name] : regData.categories.filter(x => x !== c.name);
                      setRegData({...regData, categories: newCats});
                    }} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    <span className="font-semibold text-sm">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {regData.categories.includes('Appliances') && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <label className="flex items-center gap-2 text-[11px] font-bold text-indigo-800 mb-4 tracking-wide">
                  <Briefcase className="w-4 h-4" /> APPLIANCES YOU REPAIR
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {APPLIANCE_LIST.map(app => (
                    <label key={app} className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-indigo-700 transition-colors">
                      <input type="checkbox" checked={regData.subCategories.includes(app)} onChange={e => {
                        const newApps = e.target.checked ? [...regData.subCategories, app] : regData.subCategories.filter(x => x !== app);
                        setRegData({...regData, subCategories: newApps});
                      }} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                      <span className="text-sm font-medium">{app}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 tracking-wide">YEARS OF EXPERIENCE</label>
              <input type="text" placeholder="e.g. 3" value={regData.experience} onChange={e => setRegData({...regData, experience: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setRegStep('personal')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>
              <button onClick={() => setRegStep('location')} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50" disabled={regData.categories.length === 0}>Continue to Location</button>
            </div>
          </div>
        )}

        {regStep === 'location' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-3 tracking-wide">CHOOSE YOUR CITY <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => setRegData({...regData, city})}
                    className={\`py-3 px-2 rounded-xl text-sm font-bold transition-all border \${regData.city === city ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}\`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              {regData.city && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 mt-6 tracking-wide">SERVICE DELIVERY AREAS</label>
                  <p className="text-sm text-slate-500 mb-4">Choose your area, select the radius, and we will find all pincodes within that range.</p>
                  
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <MapRadiusSelector onPincodesFound={(pins) => setRegData({...regData, service_pincodes: Array.from(new Set([...regData.service_pincodes, ...pins]))})} />
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
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setRegStep('expertise')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>
              <button onClick={() => setRegStep('verify')} disabled={!regData.city || regData.service_pincodes.length === 0} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg">Continue to Verification</button>
            </div>
          </div>
        )}
        
        {regStep === 'verify' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
            <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-bold text-indigo-900 mb-2 uppercase tracking-wide text-sm">Identity Verification</h3>
              <p className="text-sm text-indigo-600/80">Please provide your 12-digit Aadhaar number below to verify your identity and activate your account.</p>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 tracking-wide">AADHAAR CARD NUMBER <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter 12-digit Aadhaar Number" value={regData.aadharNumber || ''} onChange={e => setRegData({...regData, aadharNumber: e.target.value.replace(/\\D/g, '').slice(0, 12)})} className="w-full border border-slate-200 p-4 rounded-xl text-lg tracking-widest font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" maxLength={12} />
              <p className="text-xs text-slate-500 mt-2">Your Aadhaar number is secure and only used for background validation.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <Star className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                By submitting, you agree to our <a href="#" className="font-bold text-indigo-600 hover:underline">Partner Terms of Service</a> and consent to identity verification.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setRegStep('location')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>
              <button onClick={() => {
                setRegStep('verifying');
                setTimeout(() => {
                  setRegStep('success');
                  setTimeout(() => {
                    handleRegistrationSubmit();
                  }, 2000);
                }, 2500);
              }} disabled={!regData.aadharNumber || regData.aadharNumber.length !== 12} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50">Submit Application</button>
            </div>
          </div>
        )}
        
        {regStep === 'verifying' && (
          <div className="space-y-6 text-center py-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-3">Verifying Identity</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">Please wait while we validate your Aadhaar details with our background verification systems...</p>
          </div>
        )}

        {regStep === 'success' && (
          <div className="space-y-6 text-center py-20 animate-in zoom-in duration-500 fade-in">
            <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-lg"> 
               <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-50 delay-150"></div>
               <CheckCircle className="w-16 h-16 text-emerald-600 relative z-10 animate-bounce" />
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Congratulations! 🎉</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">Your identity has been verified successfully. Redirecting you to your brand new dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );`;

const finalContent = content.substring(0, modalStart) + newModal + content.substring(modalEnd);
fs.writeFileSync(file, finalContent);
console.log('updated modal successfully');
