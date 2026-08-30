const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const target1 = `                       <div className="relative group/input">
                          <MapIcon className="absolute left-4 top-3.5 text-indigo-300 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                          <input
                            name="locationLink"
                            value={formData.locationLink}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-indigo-50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-300"
                            placeholder="Paste Google Maps link here..." 
                          />
                       </div>`;

const target2 = `                           <div className="relative group/input">
                              <MapIcon className="absolute left-4 top-3.5 text-indigo-300 group-focus-within/input:text-indigo-600 transition-colors" size={18} />
                              <input
                                name="locationLink"
                                value={formData.locationLink}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-indigo-50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-300"
                                placeholder="Paste Google Maps link here..."
                              />
                           </div>`;

const replace1 = `                       <div className="relative group/input flex items-center">
                          <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none" size={18} />
                          <input
                            name="locationLink"
                            value={formData.locationLink}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-28 py-3.5 bg-white border-2 border-indigo-50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-300"
                            placeholder="Paste Google Maps link here..." 
                          />
                          <button
                            type="button"
                            onClick={() => setIsMapPickerOpen(true)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
                          >
                            Adjust Pin
                          </button>
                       </div>`;

const replace2 = `                           <div className="relative group/input flex items-center">
                              <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none" size={18} />
                              <input
                                name="locationLink"
                                value={formData.locationLink}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-28 py-3.5 bg-white border-2 border-indigo-50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-300"
                                placeholder="Paste Google Maps link here..."
                              />
                              <button
                                type="button"
                                onClick={() => setIsMapPickerOpen(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
                              >
                                Adjust Pin
                              </button>
                           </div>`;

if(code.includes(target1)) {
    code = code.replace(target1, replace1);
    console.log("Target 1 replaced");
} else {
    console.log("Target 1 NOT FOUND");
}

if(code.includes(target2)) {
    code = code.replace(target2, replace2);
    console.log("Target 2 replaced");
} else {
    console.log("Target 2 NOT FOUND");
}

fs.writeFileSync('pages/CustomerPanel.tsx', code);
