const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

code = code.replace(
    '<button onClick={() => setRegStep(\'expertise\')} disabled={!regData.firstName || !regData.lastName} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md">Next Step</button>',
    '<button onClick={() => setRegStep(\'expertise\')} disabled={!regData.firstName || !regData.lastName} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6 shadow-md hover:shadow-lg">Continue to Expertise</button>'
);

code = code.replace(
    '<button onClick={() => setRegStep(\'location\')} disabled={regData.categories.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50">Next Step</button>',
    '<button onClick={() => setRegStep(\'location\')} disabled={regData.categories.length === 0} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50">Continue to Location</button>'
);

code = code.replace(
    '<button onClick={() => setRegStep(\'personal\')} className="flex-1 bg-slate-200 hover:bg-slate-300 py-3.5 rounded-xl font-bold text-slate-700 transition-all">Back</button>',
    '<button onClick={() => setRegStep(\'personal\')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>'
);

code = code.replace(
    '<button onClick={() => setRegStep(\'expertise\')} className="flex-1 bg-slate-200 hover:bg-slate-300 py-3.5 rounded-xl font-bold text-slate-700 transition-all">Back</button>',
    '<button onClick={() => setRegStep(\'expertise\')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>'
);

code = code.replace(
    'className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md"\n                  >\n                    Next Step',
    'className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg"\n                  >\n                    Continue to Verification'
);

code = code.replace(
    '<button onClick={() => setRegStep(\'location\')} className="flex-1 bg-slate-200 hover:bg-slate-300 py-3.5 rounded-xl font-bold text-slate-700 transition-all">Back</button>',
    '<button onClick={() => setRegStep(\'location\')} className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all">Back</button>'
);

code = code.replace(
    '<button onClick={handleRegistrationSubmit} disabled={regData.aadharNumber.length < 12} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md">Complete Registration</button>',
    '<button onClick={handleRegistrationSubmit} disabled={regData.aadharNumber.length < 12} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50">Submit Application</button>'
);

fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Buttons fixed!");
