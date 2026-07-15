const fs = require('fs');
let content = fs.readFileSync('components/FollowUpManager.tsx', 'utf8');

const oldHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Follow-up Manager</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Reminders & Customer Follow-up System</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={16} /> New Follow-up
        </button>
      </div>`;

const newHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase leading-tight">Follow-up Manager</h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Reminders & Customer Follow-up System</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto justify-center bg-indigo-600 text-white px-4 sm:px-6 py-3 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus size={16} /> New Follow-up
        </button>
      </div>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('components/FollowUpManager.tsx', content);
