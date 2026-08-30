const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf-8');

const authRenderMatch = `  const renderAuth = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-white w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{authMode === 'login' ? 'Partner Portal' : 'Join as Partner'}</h2>
          <p className="text-gray-500">{authMode === 'login' ? 'Manage your bookings and earnings' : 'Create an account to start earning'}</p>
        </div>
        
        {authError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{authError}</div>}
        
        <div className="space-y-4">
          {authMode === 'signup' && (
            <>
              <input type="text" placeholder="Full Name" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} className="w-full border p-3 rounded-lg" />
              <input type="email" placeholder="Email Address (Optional)" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full border p-3 rounded-lg" />
            </>
          )}
          <input type="text" placeholder="Phone Number" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} className="w-full border p-3 rounded-lg" />
          <input type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full border p-3 rounded-lg" />
          
          <button onClick={authMode === 'login' ? handleLogin : handleSignup} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </div>
        <div className="mt-6 text-center border-t pt-6">
          <p className="text-gray-600 mb-4">{authMode === 'login' ? 'Want to join as a professional?' : 'Already have an account?'}</p>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-bold hover:bg-indigo-50">
            {authMode === 'login' ? 'Sign Up as Partner' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );`;

const newAuthRender = `  const renderAuth = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-white w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Partner Portal</h2>
          <p className="text-gray-500">Manage your bookings and earnings</p>
        </div>
        
        {/* Toggle Sign Up / Login */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button 
                onClick={() => setAuthMode('login')} 
                className={\`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all \${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
            >
                Login
            </button>
            <button 
                onClick={() => setAuthMode('signup')} 
                className={\`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all \${authMode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
            >
                Sign Up
            </button>
        </div>
        
        {authError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{authError}</div>}
        
        <div className="space-y-4">
          {authMode === 'signup' && (
            <>
              <input type="text" placeholder="Full Name" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} className="w-full border p-3 rounded-lg" />
              <input type="email" placeholder="Email Address (Optional)" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="w-full border p-3 rounded-lg" />
            </>
          )}
          <input type="text" placeholder="Phone Number" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} className="w-full border p-3 rounded-lg" />
          <input type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full border p-3 rounded-lg" />
          
          <button onClick={authMode === 'login' ? handleLogin : handleSignup} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 mt-2">
            {authMode === 'login' ? 'Login to Partner Panel' : 'Continue to Registration'}
          </button>
        </div>
      </div>
    </div>
  );`;

if (content.includes(authRenderMatch)) {
    content = content.replace(authRenderMatch, newAuthRender);
    fs.writeFileSync('pages/PartnerPanel.tsx', content);
    console.log("Updated renderAuth");
} else {
    console.error("authRenderMatch not found");
}
