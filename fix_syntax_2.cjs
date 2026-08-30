const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const correctBlock = `{partnerBookings.map(b => (
                <div key={b.id} className="border border-gray-200 p-4 sm:p-5 rounded-xl hover:border-indigo-300 transition-colors shadow-sm bg-white relative">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <p className="font-bold text-gray-900 text-sm sm:text-lg leading-tight">{b.subServiceName}</p>
                    <span className={\`shrink-0 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-md uppercase tracking-wider \${b.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}\`}>{b.status}</span>
                  </div>

                  {(b.status === 'accepted' || b.status === 'Forwarded' || b.status === 'in_progress') && (
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
                    {(b.status === 'accepted' || b.status === 'Forwarded' || b.status === 'in_progress') && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => handleCancelLead(b)} className="flex-1 sm:flex-none text-xs sm:text-sm font-bold bg-red-50 text-red-700 border border-red-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                          Cancel
                        </button>
                        {(b.status === 'accepted' || b.status === 'Forwarded') ? (
                          <button onClick={() => setOtpBookingId(b.id)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                            Start Job
                          </button>
                        ) : (
                          <button onClick={() => handleCompleteJob(b)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                            Mark Completed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}`;

const startIndex = content.indexOf('{partnerBookings.map(b => (');
const endIndex = content.indexOf('</div>\n          )}', startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + correctBlock + '\n            ' + content.substring(endIndex);
  fs.writeFileSync('pages/PartnerPanel.tsx', content);
  console.log("Replaced successfully");
} else {
  console.log("Could not find start or end index", startIndex, endIndex);
}
