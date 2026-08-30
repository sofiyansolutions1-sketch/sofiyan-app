const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const renderStart = content.indexOf('  return (\n    <div className="max-w-6xl');
if (renderStart === -1) {
    console.error("Could not find render start");
    process.exit(1);
}

const beforeRender = content.substring(0, renderStart);

const futuristicRender = `  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 mt-4 md:mt-8 mb-20 bg-[#0B0F19] rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] border border-indigo-500/20 relative overflow-hidden text-slate-200">
      {/* Decorative futuristic glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {renderPaymentModal()}
      {renderEditProfileModal()}

      {/* Header Profile Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-slate-700/50 shadow-lg">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[1.5rem] p-[2px] shadow-[0_0_20px_rgba(99,102,241,0.4)]">
             <div className="w-full h-full bg-[#0B0F19] rounded-[1.4rem] flex items-center justify-center">
               <User className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
             </div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-blue-200 tracking-tight truncate">SYSTEM.USER // {currentUser.name.toUpperCase()}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
               <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md">★ {currentUser.rating || "NEW"}</span>
               <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md">RAD: {currentUser.service_areas?.[0] || '5'} KM</span>
               <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md">PINS: {currentUser.service_pincodes?.length || 0}</span>
            </div>
            <p className="text-sm text-green-400 font-black mt-3 tracking-widest drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">EARNINGS: ₹{(currentUser.earnings || 0).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap w-full md:w-auto gap-3 mt-2 md:mt-0">
          <button onClick={toggleAvailability} className={\`relative group overflow-hidden flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 font-bold text-sm sm:text-base border \${currentUser.status === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'}\`}>
            <div className={\`w-2.5 h-2.5 rounded-full \${currentUser.status === 'available' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}\`}></div>
            {currentUser.status === 'available' ? 'STATUS: ACTIVE' : 'STATUS: BUSY'}
          </button>
          <button onClick={openEditProfile} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-indigo-300 hover:text-indigo-200 px-5 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/20 transition-all font-bold shadow-sm text-sm sm:text-base">
            <UserIcon size={16} /> CONFIG
          </button>
          <button onClick={handleLogout} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:bg-red-500/10 hover:border-red-500/20 transition-all font-bold shadow-sm text-sm sm:text-base">
            <LogOut size={16} /> LOGOUT
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Process Lead Panel */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 sm:p-7 rounded-[2rem] border border-slate-700/50 shadow-xl md:col-span-2 flex flex-col">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 tracking-wider uppercase"><Briefcase className="text-indigo-400 w-6 h-6" /> Active Process</h2>
          {partnerBookings.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/50 rounded-[1.5rem] border border-slate-800 border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4 text-slate-500">
                 <Briefcase className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">No Active Assignments</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Awaiting incoming data stream...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {partnerBookings.map(b => (
                <div key={b.id} className="relative overflow-hidden border border-indigo-500/20 p-5 sm:p-6 rounded-[1.5rem] hover:border-indigo-400/50 transition-all shadow-lg bg-gradient-to-b from-slate-800/50 to-slate-900/80">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <p className="font-black text-white text-lg sm:text-xl leading-tight tracking-wide">{b.subServiceName}</p>
                    <span className={\`shrink-0 text-[10px] sm:text-xs font-black px-3 py-1 rounded-md uppercase tracking-[0.2em] \${b.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}\`}>{b.status}</span>
                  </div>
                  
                  {(b.status === 'accepted' || b.status === 'Forwarded') && (
                    <div className="mb-5 p-4 bg-[#0B0F19]/80 rounded-xl border border-indigo-500/20 text-sm shadow-inner">
                      <p className="font-black text-indigo-400 mb-3 border-b border-indigo-500/20 pb-2 text-xs uppercase tracking-widest">Client Data Node</p>
                      <div className="space-y-2 font-medium text-slate-300">
                        <p className="flex items-center gap-2"><span className="text-indigo-500/50 w-4 h-4 inline-block">■</span> <strong className="text-slate-400">ID:</strong> {b.customerName}</p>
                        <p className="flex items-center gap-2"><span className="text-indigo-500/50 w-4 h-4 inline-block">■</span> <strong className="text-slate-400">COMMS:</strong> {b.contactNumber}</p>
                        <p className="flex items-start gap-2"><span className="text-indigo-500/50 w-4 h-4 inline-block mt-1">■</span> <strong className="text-slate-400">LOC:</strong> <span className="flex-1">{b.address}, {b.area}</span></p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-5 font-mono text-sm text-slate-400">
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-indigo-400 shrink-0" /> {b.pinCode}</p>
                    <p className="flex items-center gap-2"><Clock size={16} className="text-indigo-400 shrink-0" /> {b.date} // {b.time}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-5 border-t border-slate-700/50 gap-4 sm:gap-0">
                    <p className="font-black text-green-400 text-xl drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">₹{b.price}</p>
                    {(b.status === 'accepted' || b.status === 'Forwarded') && (
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={() => handleCancelLead(b)} className="flex-1 sm:flex-none text-xs sm:text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl hover:bg-rose-500/20 transition-all uppercase tracking-wider">
                          Abort
                        </button>
                        <button onClick={() => handleCompleteJob(b)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl hover:bg-indigo-500 transition-all uppercase tracking-wider">
                          Execute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Available Leads Panel */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 sm:p-7 rounded-[2rem] border border-slate-700/50 shadow-xl flex flex-col max-h-[800px] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-[2rem]"></div>
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 shrink-0 uppercase tracking-wider">
             <Star className="text-amber-400 w-6 h-6 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" /> Incoming Leads
          </h2>
          {newLeads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-slate-950/50 rounded-[1.5rem] border border-slate-800 border-dashed">
              <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase text-center">Scanning Sector...</p>
              <p className="text-xs text-slate-500 mt-2 font-medium text-center">No matching anomalies found.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 pb-4 custom-scrollbar">
              {newLeads.map(b => (
                <div key={b.id} className="group relative border p-5 rounded-[1.5rem] bg-indigo-950/40 border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full"></div>
                  
                  <div className="flex justify-between items-start mb-3 pr-4">
                    <p className="font-black text-white text-base sm:text-lg leading-tight tracking-wide group-hover:text-indigo-300 transition-colors">{b.subServiceName}</p>
                  </div>
                  <div className="font-mono space-y-2 mb-4">
                    <p className="text-xs text-slate-400 flex items-center gap-2"><MapPin size={14} className="text-indigo-500/70 shrink-0" /> <span className="truncate tracking-wider">{b.pinCode}</span></p>
                    <p className="text-xs text-slate-400 flex items-center gap-2"><Clock size={14} className="text-indigo-500/70 shrink-0" /> {b.date} // {b.time}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-indigo-500/20">
                    <p className="font-black text-green-400 text-lg drop-shadow-[0_0_5px_rgba(74,222,128,0.2)]">₹{b.price}</p>
                    <button 
                      onClick={() => handleAcceptLead(b)} 
                      disabled={!!activeJob}
                      className="text-xs sm:text-sm font-black bg-white text-indigo-900 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.2)] uppercase tracking-widest hover:scale-105 active:scale-95"
                      title={activeJob ? "Complete current job first" : "Intercept Lead"}
                    >
                      Intercept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};`;

fs.writeFileSync('pages/PartnerPanel.tsx', beforeRender + futuristicRender);
