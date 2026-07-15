const fs = require('fs');
let content = fs.readFileSync('pages/AdminPanel.tsx', 'utf8');

const oldHeader = `<h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight">FOUNDER DASHBOARD</h1>
          <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">OPERATIONAL CONTROL CENTER</p>`;

const newHeader = `<h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight">FOUNDER DASHBOARD</h1>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">OPERATIONAL CONTROL CENTER</p>`;

content = content.replace(oldHeader, newHeader);

const oldGrid = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">`;
const newGrid = `<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">`;

content = content.replace(oldGrid, newGrid);

const oldStatCard = `const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
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

const newStatCard = `const StatCard = ({ title, value, icon, color, bg }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className={\`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl \${bg} \${color} shadow-inner shrink-0 inline-flex\`}>
      {/* Clone the icon to make it smaller on mobile if possible, or just let CSS scale it, but since it's ReactNode, we wrap it in a div that scales down */}
      <div className="transform scale-75 sm:scale-100 origin-center flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="min-w-0 w-full mt-1 sm:mt-0">
      <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{title}</p>
      <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tighter truncate">{value}</h3>
    </div>
  </div>
);`;

content = content.replace(oldStatCard, newStatCard);

fs.writeFileSync('pages/AdminPanel.tsx', content);
