const fs = require('fs');
const file = 'pages/AdminPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \[currentAdminTab, setCurrentAdminTab\] = useState<\'Pending\' \| \'Forwarded\' \| \'Accepted\' \| \'Completed\'>\(\'Pending\'\);/,
  `const [currentAdminTab, setCurrentAdminTab] = useState<'Pending' | 'Forwarded' | 'Accepted' | 'Review' | 'Completed'>('Pending');`
);

content = content.replace(
  /const displayedBookings = bookings\.filter\(b => \{\n\s*if \(currentAdminTab === 'Pending'\) return b\.status === 'pending';\n\s*if \(currentAdminTab === 'Forwarded'\) return b\.status === 'Forwarded';\n\s*if \(currentAdminTab === 'Accepted'\) return b\.status === 'accepted';\n\s*if \(currentAdminTab === 'Completed'\) return b\.status === 'completed';\n\s*return false;\n\s*\}\);/,
  `const displayedBookings = bookings.filter(b => {
    if (currentAdminTab === 'Pending') return b.status === 'pending';
    if (currentAdminTab === 'Forwarded') return b.status === 'Forwarded';
    if (currentAdminTab === 'Accepted') return b.status === 'accepted';
    if (currentAdminTab === 'Review') return b.status === 'admin_review';
    if (currentAdminTab === 'Completed') return b.status === 'completed';
    return false;
  });`
);

content = content.replace(
  /const acceptedJobs = bookings\.filter\(b => b\.status === 'accepted'\)\.length;/,
  `const acceptedJobs = bookings.filter(b => b.status === 'accepted').length;
  const reviewJobs = bookings.filter(b => b.status === 'admin_review').length;`
);

content = content.replace(
  /<button \n\s*onClick=\{\(\) => setCurrentAdminTab\(\'Completed\'\)\} \n\s*className=\{`px-6 py-2 rounded-xl text-\[10px\] font-black uppercase tracking-widest transition-all \$\{currentAdminTab === \'Completed\' \? \'bg-indigo-600 text-white shadow-lg shadow-indigo-100\' : \'text-gray-500 hover:text-indigo-600\'\}`\}\n\s*>\n\s*Completed \(\{completedJobs\}\)\n\s*<\/button>/,
  `<button 
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
                </button>`
);

content = content.replace(
  /\{\(booking\.status === \'Forwarded\' \|\| booking\.status === \'accepted\'\) && \(/,
  `{(booking.status === 'Forwarded' || booking.status === 'accepted' || booking.status === 'admin_review') && (`
);

content = content.replace(
  /<CheckCircle size=\{12\} \/> Complete & Rate/,
  `<CheckCircle size={12} /> {booking.status === 'admin_review' ? 'Verify Payment & Rate' : 'Complete & Rate'}`
);

fs.writeFileSync(file, content);
console.log("Patched AdminPanel.tsx review tabs");
