const fs = require('fs');
const file = 'pages/AdminPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{partners\s*\.filter\(p => \{\s*if \(directoryStatusFilter !== \'all\' && p\.status !== directoryStatusFilter\) return false;\s*if \(directorySearchQuery\.trim\(\)\) \{\s*const q = directorySearchQuery\.toLowerCase\(\);\s*return \(\s*p\.name\?\.toLowerCase\(\)\.includes\(q\) \|\|\s*p\.phone\?\.includes\(q\) \|\|\s*p\.city\?\.toLowerCase\(\)\.includes\(q\) \|\|\s*p\.pincode\?\.includes\(q\) \|\|\s*\(p\.categories \|\| \[\]\)\.some\(c => c\.toLowerCase\(\)\.includes\(q\)\) \|\|\s*\(p\.sub_categories \|\| \[\]\)\.some\(sc => sc\.toLowerCase\(\)\.includes\(q\)\)\s*\);\s*\}\s*return true;\s*\}\)\s*\.map\(partner => \(/g,
  `{partners
              .filter(p => {
                if (directoryStatusFilter !== 'all' && p.status !== directoryStatusFilter) return false;
                if (directorySearchQuery.trim()) {
                  const q = directorySearchQuery.toLowerCase();
                  return (
                    p.name?.toLowerCase().includes(q) ||
                    p.phone?.includes(q) ||
                    p.city?.toLowerCase().includes(q) ||
                    p.pincode?.includes(q) ||
                    (p.categories || []).some(c => c.toLowerCase().includes(q)) ||
                    (p.sub_categories || []).some(sc => sc.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                if (ratingB !== ratingA) return ratingB - ratingA;
                const jobsA = a.completedJobs || 0;
                const jobsB = b.completedJobs || 0;
                if (jobsB !== jobsA) return jobsB - jobsA;
                const earnA = a.earnings || 0;
                const earnB = b.earnings || 0;
                return earnB - earnA;
              })
              .map((partner, index) => (`
);

content = content.replace(
  /\{partner\.name\.charAt\(0\)\}\s*<\/div>/g,
  `{partner.name.charAt(0)}
                      </div>
                      {index < 3 && directoryStatusFilter === 'all' && !directorySearchQuery && (
                        <div className={\`absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md \${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}\`}>
                          #{index + 1}
                        </div>
                      )}`
);

content = content.replace(
  /<div className="flex items-center gap-2\.5 min-w-0">/g,
  `<div className="flex items-center gap-2.5 min-w-0 relative">`
);

fs.writeFileSync(file, content);
console.log("Patched AdminPanel.tsx rankings");
