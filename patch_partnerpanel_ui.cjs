const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldReturn = `return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 mt-2 md:mt-6">
      {renderPaymentModal()}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {currentUser.name}</h1>
            <p className="text-sm text-gray-500 font-medium">Rating: ★ {currentUser.rating || "New"} • {currentUser.service_pincodes?.length || 0} Pincodes covered</p>
            <p className="text-xs text-green-600 font-bold mt-1">Earnings: ₹{(currentUser.earnings || 0).toFixed(2)}</p>
          </div>
        </div>
        {renderEditProfileModal()}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <button onClick={openEditProfile} className="w-full sm:w-auto flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 px-4 py-2.5 sm:py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors font-bold shadow-sm">
            <UserIcon size={16} /> Edit Profile
          </button>
          <button onClick={handleLogout} className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2.5 sm:py-2 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors font-bold shadow-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">`;

const newReturn = `return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 mt-2 md:mt-6 pb-20">
      {renderPaymentModal()}
      {renderEditProfileModal()}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <User className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Welcome, {currentUser.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">★ {currentUser.rating || "New"} • {currentUser.service_pincodes?.length || 0} Pincodes covered</p>
            <p className="text-xs text-green-600 font-bold mt-0.5">Earnings: ₹{(currentUser.earnings || 0).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex flex-row w-full md:w-auto gap-2 mt-2 md:mt-0">
          <button onClick={openEditProfile} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 px-3 py-2 sm:px-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors font-bold shadow-sm text-sm sm:text-base">
            <UserIcon size={16} /> Edit Profile
          </button>
          <button onClick={handleLogout} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-3 py-2 sm:px-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors font-bold shadow-sm text-sm sm:text-base">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">`;

content = content.replace(oldReturn, newReturn);

const oldProcessLead = `<div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="text-indigo-600 w-5 h-5" /> Process Lead</h2>
          {partnerBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No jobs assigned yet.</p>
              <p className="text-xs text-gray-400 mt-2">Accept a lead from the Available Leads panel to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partnerBookings.map(b => (
                <div key={b.id} className="border p-5 rounded-xl hover:border-indigo-300 transition-colors shadow-sm bg-white relative">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-gray-900 text-lg">{b.subServiceName}</p>
                    <span className={\`text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider \${b.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}\`}>{b.status}</span>
                  </div>
                  
                  {(b.status === 'accepted' || b.status === 'Forwarded') && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm">
                      <p className="font-bold text-indigo-900 mb-1">Customer Details</p>
                      <p className="text-indigo-800"><strong>Name:</strong> {b.customerName}</p>
                      <p className="text-indigo-800"><strong>Phone:</strong> {b.contactNumber}</p>
                      <p className="text-indigo-800"><strong>Address:</strong> {b.address}, {b.area}</p>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-2"><MapPin size={16} className="text-gray-400" /> {b.pinCode}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-4"><Clock size={16} className="text-gray-400" /> {b.date} at {b.time}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="font-bold text-green-600 text-lg">₹{b.price}</p>
                    {(b.status === 'accepted' || b.status === 'Forwarded') && (
                      <div className="flex gap-2">
                        <button onClick={() => handleCancelLead(b)} className="text-sm font-bold bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleCompleteJob(b)} className="text-sm font-bold bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md">
                          Mark Completed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>`;

const newProcessLead = `<div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="text-indigo-600 w-5 h-5" /> Process Lead</h2>
          {partnerBookings.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm font-medium">No jobs assigned yet.</p>
              <p className="text-xs text-gray-400 mt-2">Accept a lead from the Available Leads panel to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partnerBookings.map(b => (
                <div key={b.id} className="border border-gray-200 p-4 sm:p-5 rounded-xl hover:border-indigo-300 transition-colors shadow-sm bg-white relative">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <p className="font-bold text-gray-900 text-base sm:text-lg leading-tight">{b.subServiceName}</p>
                    <span className={\`shrink-0 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-md uppercase tracking-wider \${b.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}\`}>{b.status}</span>
                  </div>
                  
                  {(b.status === 'accepted' || b.status === 'Forwarded') && (
                    <div className="mb-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-sm">
                      <p className="font-bold text-indigo-900 mb-2 border-b border-indigo-100 pb-1">Customer Details</p>
                      <div className="space-y-1">
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Name:</strong> {b.customerName}</p>
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Phone:</strong> {b.contactNumber}</p>
                        <p className="text-indigo-800 break-words"><strong className="text-indigo-900">Address:</strong> {b.address}, {b.area}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{b.pinCode}</span></p>
                    <p className="text-sm text-gray-600 flex items-center gap-2"><Clock size={16} className="text-gray-400 shrink-0" /> {b.date} at {b.time}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                    <p className="font-bold text-green-600 text-lg">₹{b.price}</p>
                    {(b.status === 'accepted' || b.status === 'Forwarded') && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => handleCancelLead(b)} className="flex-1 sm:flex-none text-xs sm:text-sm font-bold bg-red-50 text-red-700 border border-red-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleCompleteJob(b)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm whitespace-nowrap">
                          Mark Completed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>`;

content = content.replace(oldProcessLead, newProcessLead);

fs.writeFileSync('pages/PartnerPanel.tsx', content);
