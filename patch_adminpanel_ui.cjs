const fs = require('fs');
let content = fs.readFileSync('pages/AdminPanel.tsx', 'utf8');

const oldReturn = `return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">FOUNDER DASHBOARD</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Operational Control Center</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setShowPartnersDirectory(true)}
              className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition shadow-sm border border-indigo-100 flex items-center gap-2"
            >
                <Users size={14} /> Technician Directory
            </button>
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition">
                <FileSpreadsheet className="inline mr-2" size={14} /> Export Data
            </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-10 bg-gray-100 p-1 rounded-2xl w-fit overflow-x-auto">
        <button onClick={() => setMainTab('Dashboard')} className={\`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'Dashboard' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Operational</button>
        <button onClick={() => setMainTab('FollowUps')} className={\`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'FollowUps' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Follow-ups</button>
        <button onClick={() => setMainTab('BlogManager')} className={\`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'BlogManager' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Marketing</button>
        <button onClick={() => setMainTab('PartnerManagement')} className={\`py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'PartnerManagement' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Supply</button>
      </div>`;

const newReturn = `return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight">FOUNDER DASHBOARD</h1>
          <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">OPERATIONAL CONTROL CENTER</p>
        </div>
        <div className="flex flex-row w-full md:w-auto gap-2 sm:gap-3">
            <button 
              onClick={() => setShowPartnersDirectory(true)}
              className="flex-1 md:flex-none justify-center bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition shadow-sm border border-indigo-100 flex items-center gap-2 text-center"
            >
                <Users size={14} className="shrink-0" /> <span>Technician Directory</span>
            </button>
            <button className="flex-1 md:flex-none justify-center bg-gray-100 text-gray-600 px-3 sm:px-4 py-3 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition flex items-center gap-2 text-center">
                <FileSpreadsheet className="shrink-0" size={14} /> <span>Export Data</span>
            </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-6 sm:mb-10 bg-gray-100 p-1 rounded-2xl w-full md:w-fit overflow-x-auto scrollbar-hide">
        <button onClick={() => setMainTab('Dashboard')} className={\`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'Dashboard' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Operational</button>
        <button onClick={() => setMainTab('FollowUps')} className={\`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'FollowUps' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Follow-ups</button>
        <button onClick={() => setMainTab('BlogManager')} className={\`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'BlogManager' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Marketing</button>
        <button onClick={() => setMainTab('PartnerManagement')} className={\`flex-shrink-0 py-2.5 px-4 sm:px-6 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap \${mainTab === 'PartnerManagement' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}>Supply</button>
      </div>`;

content = content.replace(oldReturn, newReturn);

const oldStatCard = `const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className={\`p-4 rounded-2xl \${bg} \${color} shadow-inner\`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
    </div>
  </div>
);`;

const newStatCard = `const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-5 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 sm:gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className={\`p-3 sm:p-4 rounded-2xl \${bg} \${color} shadow-inner shrink-0\`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter truncate">{value}</h3>
    </div>
  </div>
);`;

content = content.replace(oldStatCard, newStatCard);

fs.writeFileSync('pages/AdminPanel.tsx', content);
