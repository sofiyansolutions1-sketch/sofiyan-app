const fs = require('fs');
let content = fs.readFileSync('pages/AdminPanel.tsx', 'utf8');

const oldRegistry = `<div className="px-8 py-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Lead Registry</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Incoming Service Traffic</p>
              </div>
              
              <div className="flex bg-white rounded-2xl p-1 border border-gray-200">
                <button 
                    onClick={() => setCurrentAdminTab('Pending')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    New Leads ({pendingJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Forwarded')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Forwarded' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Dispatched ({forwardedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Accepted')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Accepted' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Accepted ({acceptedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Review')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Review' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Review ({reviewJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Completed')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Completed ({completedJobs})
                </button>
              </div>
            </div>`;

const newRegistry = `<div className="px-5 sm:px-8 py-6 sm:py-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-gray-900">Lead Registry</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Incoming Service Traffic</p>
              </div>
              
              <div className="flex bg-white rounded-2xl p-1 border border-gray-200 w-full md:w-auto overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setCurrentAdminTab('Pending')} 
                    className={\`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    New Leads ({pendingJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Forwarded')} 
                    className={\`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Forwarded' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Dispatched ({forwardedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Accepted')} 
                    className={\`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Accepted' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Accepted ({acceptedJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Review')} 
                    className={\`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Review' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Review ({reviewJobs})
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Completed')} 
                    className={\`whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Completed ({completedJobs})
                </button>
              </div>
            </div>`;

content = content.replace(oldRegistry, newRegistry);

fs.writeFileSync('pages/AdminPanel.tsx', content);
