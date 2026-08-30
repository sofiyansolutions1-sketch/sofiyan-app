const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldStart = `      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-50 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
          <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Complete Your Profile</h2>
              <p className="text-slate-500 text-sm mt-1">Step {regStep === 'personal' ? 1 : regStep === 'expertise' ? 2 : regStep === 'location' ? 3 : regStep === 'verify' ? 4 : 5} of 4</p>
            </div>
            {!isMandatory && (
              <button onClick={() => setIsRegistrationOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                <X size={24} />
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto p-6 sm:p-8 flex-1">
            {regStep === 'personal' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><UserIcon className="text-indigo-600" /> Personal Information</h3>`;

const newStart = `    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
        {!isMandatory && (
          <button onClick={() => setIsRegistrationOpen(false)} className="absolute top-6 right-6 text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wide">Cancel</button>
        )}
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
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300 fade-in">`;

if (code.includes(oldStart)) {
    code = code.replace(oldStart, newStart);
    
    // now fix the ending
    const oldEnd = `          </div>
        </div>
      </div>
    );
  };`;
    const newEnd = `      </div>
    </div>
  );
  };`;
  
    code = code.replace(oldEnd, newEnd);
    
    // Also let's fix inner step headers:
    // For expertise step:
    const expStartOld = `{regStep === 'expertise' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Briefcase className="text-indigo-600" /> Professional Expertise</h3>`;
    const expStartNew = `{regStep === 'expertise' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">`;
    code = code.replace(expStartOld, expStartNew);
    
    // For location step:
    const locStartOld = `{regStep === 'location' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><MapPin className="text-indigo-600" /> Service Location</h3>`;
    const locStartNew = `{regStep === 'location' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">`;
    code = code.replace(locStartOld, locStartNew);

    // For verify step:
    const verStartOld = `{regStep === 'verify' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><ShieldCheck className="text-indigo-600" /> Identity Verification</h3>`;
    const verStartNew = `{regStep === 'verify' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">`;
    code = code.replace(verStartOld, verStartNew);
    
    fs.writeFileSync('pages/PartnerPanel.tsx', code);
    console.log("Wrapper successfully reverted!");
} else {
    console.log("oldStart not found in code.");
}
