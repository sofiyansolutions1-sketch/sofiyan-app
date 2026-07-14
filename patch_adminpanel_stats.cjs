const fs = require('fs');
const file = 'pages/AdminPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
/<div>\s*<span className="text-\[6\.5px\] font-black text-indigo-300 uppercase tracking-wider block">Completed Tasks<\/span>\s*<span className="font-extrabold text-white">\{pt\?\.completedJobs \|\| 1\}\+ Jobs Done<\/span>\s*<\/div>/,
`<div>
                              <span className="text-[6.5px] font-black text-indigo-300 uppercase tracking-wider block">Contact Number</span>
                              <span className="font-extrabold text-white">{booking.assignedPartnerPhone}</span>
                            </div>`
);

fs.writeFileSync(file, content);
console.log("Patched AdminPanel.tsx stats");
