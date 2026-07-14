const fs = require('fs');
const file = 'pages/AdminPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const assignedJobs = bookings\.filter\(b => b\.status === 'Forwarded' \|\| b\.status === 'accepted'\)\.length;/,
  `const assignedJobs = bookings.filter(b => b.status === 'Forwarded' || b.status === 'accepted').length;
  const forwardedJobs = bookings.filter(b => b.status === 'Forwarded').length;
  const acceptedJobs = bookings.filter(b => b.status === 'accepted').length;`
);

content = content.replace(
  /<button \s*onClick=\{\(\) => setCurrentAdminTab\(\'Forwarded\'\)\} \s*className=\{`px-6 py-2 rounded-xl text-\[10px\] font-black uppercase tracking-widest transition-all \$\{currentAdminTab === \'Forwarded\' \? \'bg-indigo-600 text-white shadow-lg shadow-indigo-100\' : \'text-gray-500 hover:text-indigo-600\'\}`\}\s*>\s*Dispatched\s*<\/button>\s*<button \s*onClick=\{\(\) => setCurrentAdminTab\(\'Accepted\'\)\} \s*className=\{`px-6 py-2 rounded-xl text-\[10px\] font-black uppercase tracking-widest transition-all \$\{currentAdminTab === \'Accepted\' \? \'bg-indigo-600 text-white shadow-lg shadow-indigo-100\' : \'text-gray-500 hover:text-indigo-600\'\}`\}\s*>\s*Accepted\s*<\/button>\s*<button \s*onClick=\{\(\) => setCurrentAdminTab\(\'Completed\'\)\} \s*className=\{`px-6 py-2 rounded-xl text-\[10px\] font-black uppercase tracking-widest transition-all \$\{currentAdminTab === \'Completed\' \? \'bg-indigo-600 text-white shadow-lg shadow-indigo-100\' : \'text-gray-500 hover:text-indigo-600\'\}`\}\s*>\s*Completed\s*<\/button>/g,
  `<button 
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
                    onClick={() => setCurrentAdminTab('Completed')} 
                    className={\`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${currentAdminTab === 'Completed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'}\`}
                >
                    Completed ({completedJobs})
                </button>`
);

fs.writeFileSync(file, content);
console.log("Patched AdminPanel.tsx tab counts");
