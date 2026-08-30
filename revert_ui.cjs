const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const renderStart = content.indexOf('  return (\n    <div className="max-w-7xl');
if (renderStart === -1) {
    console.error("Could not find render start");
    process.exit(1);
}

const beforeRender = content.substring(0, renderStart);

const lightRender = `  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 mt-2 md:mt-6 pb-24">
      {renderPaymentModal()}
      {renderEditProfileModal()}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Welcome, {currentUser.name}</h1>
            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
              ★ {currentUser.rating || "New"} • {currentUser.service_areas?.[0] || '5'} KM • {currentUser.service_pincodes?.length || 0} Pins
            </p>
            <p className="text-xs sm:text-sm text-green-600 font-bold mt-1">Earnings: ₹{(currentUser.earnings || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-wrap w-full sm:w-auto gap-2 mt-2 sm:mt-0">
          <button onClick={toggleAvailability} className={\`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-xl transition-colors font-bold shadow-sm text-xs sm:text-sm \${currentUser.status === 'available' ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}\`}>
            <div className={\`w-2 h-2 rounded-full \${currentUser.status === 'available' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}\`}></div>
            {currentUser.status === 'available' ? 'Available' : 'Busy'}
          </button>
          <button onClick={openEditProfile} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 px-3 py-2 sm:px-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors font-bold shadow-sm text-xs sm:text-sm">
            <UserIcon size={14} /> Profile
          </button>
          <button onClick={handleLogout} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-3 py-2 sm:px-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors font-bold shadow-sm text-xs sm:text-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Process / Process Lead */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 flex flex-col">
          <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Briefcase className="text-indigo-600 w-5 h-5" /> Process Lead
          </h2>
          {partnerBookings.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No jobs assigned yet.</p>
              <p className="text-xs text-gray-400 mt-1">Accept a lead from the Available Leads panel to get started.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {partnerBookings.map(b => (
                <div key={b.id} className="border border-gray-200 p-4 sm:p-5 rounded-xl hover:border-indigo-300 transition-colors shadow-sm bg-white relative">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-lg leading-tight">{b.subServiceName}</p>
                    <span className={\`shrink-0 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-md uppercase tracking-wider \${b.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}\`}>{b.status}</span>
                  </div>

                  {(b.status === 'accepted' || b.status === 'Forwarded') && (
                    <div className="mb-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs sm:text-sm">
                      <p className="font-bold text-indigo-900 mb-2 border-b border-indigo-100 pb-1">Customer Details</p>
                      <div className="space-y-1">
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Name:</strong> {b.customerName}</p>
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Phone:</strong> {b.contactNumber}</p>
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Address:</strong> {b.address}, {b.area}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5"><MapPin size={14} className="text-gray-400 shrink-0" /> <span className="truncate">{b.pinCode}</span></p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5"><Clock size={14} className="text-gray-400 shrink-0" /> {b.date} at {b.time}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-3 sm:pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                    <p className="font-bold text-green-600 text-base sm:text-lg">₹{b.price}</p>
                    {(b.status === 'accepted' || b.status === 'Forwarded') && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => handleCancelLead(b)} className="flex-1 sm:flex-none text-xs sm:text-sm font-bold bg-red-50 text-red-700 border border-red-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleCompleteJob(b)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                          Mark Completed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Leads */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-auto md:max-h-[800px]">
          <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Star className="text-amber-500 w-5 h-5" /> Available Leads
          </h2>
          {newLeads.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No new leads.</p>
              <p className="text-xs text-gray-400 mt-1">We will notify you when a job matches.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-1 pb-2 custom-scrollbar">
              {newLeads.map(b => (
                <div key={b.id} className="border p-3 sm:p-4 rounded-xl bg-amber-50/30 border-amber-100 hover:border-amber-300 transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{b.subServiceName}</p>
                    <span className="shrink-0 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded uppercase tracking-wider">NEW</span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-1"><MapPin size={12} className="text-gray-400 shrink-0" /> <span className="truncate">{b.pinCode}</span></p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-3"><Clock size={12} className="text-gray-400 shrink-0" /> {b.date} • {b.time}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-amber-100/50">
                    <p className="font-bold text-green-600 text-sm sm:text-base">₹{b.price}</p>
                    <button
                      onClick={() => handleAcceptLead(b)}
                      disabled={!!activeJob}
                      className="text-xs sm:text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      title={activeJob ? "Complete current job first" : "Accept Lead"}
                    >
                      Accept
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
};
`;

fs.writeFileSync('pages/PartnerPanel.tsx', beforeRender + lightRender);
