const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Update formData initialization to set default city to Bangalore
content = content.replace(
  "city: localStorage.getItem('preferredCity') || '',",
  "city: localStorage.getItem('preferredCity') || 'Bangalore',"
);

// Replace the Area selection with a simple input
const areaRegex = /<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Area \(Tap to Select\)<\/label>[\s\S]*?(?=<\/div>\s*<\/div>\s*<div>\s*<label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">Pincode)/;
const areaReplacement = `<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Area / Locality</label>
                            <input name="area" value={formData.area} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="Enter your area" />
                          </div>
                       </div>
`;

content = content.replace(areaRegex, areaReplacement);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
