const fs = require('fs');
const file = 'pages/AdminPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \[currentAdminTab, setCurrentAdminTab\] = useState<\'Pending\' \| \'Forwarded\'>\(\'Pending\'\);/,
  `const [currentAdminTab, setCurrentAdminTab] = useState<'Pending' | 'Forwarded' | 'Accepted' | 'Completed'>('Pending');`
);

content = content.replace(
  /const displayedBookings = bookings\.filter\(b => \{\n\s*if \(currentAdminTab === 'Pending'\) return b\.status === 'pending';\n\s*if \(currentAdminTab === 'Forwarded'\) return b\.status === 'Forwarded' \|\| b\.status === 'accepted' \|\| b\.status === 'completed';\n\s*return false;\n\s*\}\);/,
  `const displayedBookings = bookings.filter(b => {
    if (currentAdminTab === 'Pending') return b.status === 'pending';
    if (currentAdminTab === 'Forwarded') return b.status === 'Forwarded';
    if (currentAdminTab === 'Accepted') return b.status === 'accepted';
    if (currentAdminTab === 'Completed') return b.status === 'completed';
    return false;
  });`
);

content = content.replace(
  /<div className="flex bg-white rounded-2xl p-1 border border-gray-200">\s*<button \s*onClick=\{\(\) => setCurrentAdminTab\(\'Pending\'\)\} \s*className=\{`px-6 py-2 rounded-xl text-\[10px\] font-black uppercase tracking-widest transition-all \$\{currentAdminTab === \'Pending\' \? \'bg-indigo-600 text-white shadow-lg shadow-indigo-100\' : \'text-gray-500 hover:text-indigo-600\'\}`\}\s*>\s*New Leads \(\{pendingJobs\}\)\s*<\/button>\s*<button \s*onClick=\{\(\) => setCurrentAdminTab\(\'Forwarded\'\)\} \s*className=\{`px-6 py-2 rounded-xl text-\[10px\] font-black uppercase tracking-widest transition-all \$\{currentAdminTab === \'Forwarded\' \? \'bg-indigo-600 text-white shadow-lg shadow-indigo-100\' : \'text-gray-500 hover:text-indigo-600\'\}`\}\s*>\s*Dispatched\s*<\/button>\s*<\/div>/,
  `<div className="flex bg-white rounded-2xl p-1 border border-gray-200">
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
                    Dispatched
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Accepted')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Accepted' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Accepted
                </button>
                <button 
                    onClick={() => setCurrentAdminTab('Completed')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Completed
                </button>
              </div>`
);

fs.writeFileSync(file, content);
console.log("Patched AdminPanel.tsx tabs");
