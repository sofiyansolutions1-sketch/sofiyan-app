const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldAuthStart = `  const renderAuth = () => (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-2 text-indigo-900">Partner Portal</h2>
        <p className="text-gray-500 text-center mb-8">Join our network of professionals</p>
        
        {authError && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">{authError}</div>}
        
        <div className="space-y-4">
          {authMode === 'signup' && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={authData.name} 
              onChange={e => setAuthData({...authData, name: e.target.value})} 
              className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          )}
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={authData.phone} 
            onChange={e => setAuthData({...authData, phone: e.target.value})} 
            className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={authData.password} 
            onChange={e => setAuthData({...authData, password: e.target.value})} 
            className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
          
          <button 
            onClick={authMode === 'login' ? handleLogin : handleSignup} 
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            {authMode === 'login' ? 'Login as Partner' : 'Create Partner Account'}
          </button>
        </div>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-bold hover:underline">
            {authMode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );`;

const newAuthStart = `  const renderAuth = () => (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl max-w-md w-full border border-slate-100 flex flex-col items-center">
        
        {/* Top Icon */}
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-md">
          <Briefcase className="w-8 h-8 text-white" />
        </div>

        {/* Headings */}
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Partner Portal</h2>
        <p className="text-slate-500 text-sm mb-8 text-center">Manage your bookings and earnings</p>
        
        {/* Toggle (Login / Sign Up) */}
        <div className="w-full bg-slate-50 p-1 rounded-2xl flex mb-6 border border-slate-100">
          <button 
            onClick={() => setAuthMode('login')} 
            className={\`flex-1 py-3 text-sm font-bold rounded-xl transition-all \${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
          >
            Login
          </button>
          <button 
            onClick={() => setAuthMode('signup')} 
            className={\`flex-1 py-3 text-sm font-bold rounded-xl transition-all \${authMode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="w-full bg-red-50 text-red-600 px-5 py-4 rounded-xl mb-6 text-sm border border-red-100/50">
            {authError}
          </div>
        )}
        
        {/* Form */}
        <div className="w-full space-y-4">
          {authMode === 'signup' && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={authData.name} 
                onChange={e => setAuthData({...authData, name: e.target.value})} 
                className="w-full border border-slate-200 bg-indigo-50/30 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-50/50 outline-none transition-all placeholder:text-slate-700 font-medium" 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={authData.email || ''} 
                onChange={e => setAuthData({...authData, email: e.target.value})} 
                className="w-full border border-slate-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-50/30 outline-none transition-all placeholder:text-slate-700 font-medium" 
              />
            </>
          )}
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={authData.phone} 
            onChange={e => setAuthData({...authData, phone: e.target.value})} 
            className="w-full border border-slate-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-50/30 outline-none transition-all placeholder:text-slate-700 font-medium" 
          />
          <input 
            type="password" 
            placeholder="........" 
            value={authData.password} 
            onChange={e => setAuthData({...authData, password: e.target.value})} 
            className="w-full border border-slate-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-50/30 outline-none transition-all placeholder:text-slate-700 font-bold tracking-widest text-lg" 
          />
          
          <button 
            onClick={authMode === 'login' ? handleLogin : handleSignup} 
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md mt-2"
          >
            {authMode === 'login' ? 'Login' : 'Continue to Registration'}
          </button>
        </div>
      </div>
    </div>
  );`;

if (code.includes(oldAuthStart)) {
  code = code.replace(oldAuthStart, newAuthStart);
} else {
  console.log("Could not find oldAuthStart to replace.");
}

const oldHandleSignup = `  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name) {
      setAuthError("Please fill all required fields");
      return;
    }
    
    setRegData(prev => ({
        ...prev,
        firstName: authData.name.split(' ')[0] || '',
        lastName: authData.name.split(' ').slice(1).join(' ') || '',
        phone: authData.phone,
        password: authData.password
    }));
    setIsPendingSignup(true);
    setAuthError(null);
  };`;

const newHandleSignup = `  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name || !authData.email) {
      setAuthError("Please fill all required fields");
      return;
    }
    
    setRegData(prev => ({
        ...prev,
        firstName: authData.name.split(' ')[0] || '',
        lastName: authData.name.split(' ').slice(1).join(' ') || '',
        email: authData.email,
        phone: authData.phone,
        password: authData.password
    }));
    setIsPendingSignup(true);
    setAuthError(null);
  };`;

if (code.includes(oldHandleSignup)) {
    code = code.replace(oldHandleSignup, newHandleSignup);
} else {
    console.log("Could not find oldHandleSignup.");
}

fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Auth replaced");
