const fs = require('fs');
let content = fs.readFileSync('components/PartnerManager.tsx', 'utf8');

const oldHeader = `<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Quality Control & Action System</h2>
                <div className="w-64">
                    <input 
                        type="text" 
                        placeholder="Search partners..." 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>`;

const newHeader = `<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">Technician Directory</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Quality Control & Action System</p>
                </div>
                <div className="w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Search partners..." 
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('components/PartnerManager.tsx', content);
