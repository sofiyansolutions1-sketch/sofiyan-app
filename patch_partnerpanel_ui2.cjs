const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldLeads = `<div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[800px]">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 shrink-0"><Star className="text-amber-500 w-5 h-5" /> Available Leads</h2>
          {newLeads.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No new leads.</p>
              <p className="text-xs text-gray-400 mt-2">We will notify you when a job matches your profile.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 pb-4">
              {newLeads.map(b => (
                <div key={b.id} className="border p-4 rounded-xl bg-amber-50/30 border-amber-100 hover:border-amber-300 transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-gray-900">{b.subServiceName}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded uppercase tracking-wider">NEW</span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-1"><MapPin size={12} className="text-gray-400" /> {b.pinCode}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-3"><Clock size={12} className="text-gray-400" /> {b.date} • {b.time}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-amber-100/50">
                    <p className="font-bold text-green-600 text-sm">₹{b.price}</p>
                    <button 
                      onClick={() => handleAcceptLead(b)} 
                      disabled={!!activeJob}
                      className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      title={activeJob ? "Complete current job first" : "Accept Lead"}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>`;

const newLeads = `<div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[800px]">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 shrink-0"><Star className="text-amber-500 w-5 h-5" /> Available Leads</h2>
          {newLeads.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No new leads.</p>
              <p className="text-xs text-gray-400 mt-2">We will notify you when a job matches your profile.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 pb-4">
              {newLeads.map(b => (
                <div key={b.id} className="border p-4 rounded-xl bg-amber-50/30 border-amber-100 hover:border-amber-300 transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{b.subServiceName}</p>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded uppercase tracking-wider">NEW</span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-1"><MapPin size={12} className="text-gray-400 shrink-0" /> <span className="truncate">{b.pinCode}</span></p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-3"><Clock size={12} className="text-gray-400 shrink-0" /> {b.date} • {b.time}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-amber-100/50">
                    <p className="font-bold text-green-600 text-sm sm:text-base">₹{b.price}</p>
                    <button 
                      onClick={() => handleAcceptLead(b)} 
                      disabled={!!activeJob}
                      className="text-xs sm:text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      title={activeJob ? "Complete current job first" : "Accept Lead"}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>`;

content = content.replace(oldLeads, newLeads);

fs.writeFileSync('pages/PartnerPanel.tsx', content);
