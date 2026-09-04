const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCode = `        {/* Quick Links Section */}
        <div className="py-12 bg-white border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 mt-12">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Quick Links</h2>
            
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                Provided Services Across Various Cities in India
              </h3>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {CITY_DATA.map(city => (
                  <Link 
                    key={city.name} 
                    to={\`/\${city.name.toLowerCase()}\`} 
                    onClick={() => {
                      localStorage.setItem('preferredCity', city.name);
                      window.dispatchEvent(new Event('cityUpdated'));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                Other Services We Offer in {activeCity}
              </h3>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {SERVICES.map(service => (
                  <Link 
                    key={service.name} 
                    to={\`/\${(activeCity).toLowerCase()}\`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                    {service.name} in {activeCity}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>`;

const newCode = `        {/* Quick Links Section */}
        {activeCity.toLowerCase() === 'bangalore' && (
          <div className="py-12 bg-white border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 mt-12">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Quick Links</h2>
              
              <div className="mb-10">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  Provided Services Across Various Cities in India
                </h3>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {CITY_DATA.map(city => (
                    <Link 
                      key={city.name} 
                      to={\`/\${city.name.toLowerCase()}\`} 
                      onClick={() => {
                        localStorage.setItem('preferredCity', city.name);
                        window.dispatchEvent(new Event('cityUpdated'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  Other Services We Offer in Bangalore
                </h3>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {[
                    "Home Cleaning Services in Bangalore",
                    "Electrician Services in Bangalore",
                    "Plumber Services in Bangalore",
                    "AC Service & Repair in Bangalore",
                    "Appliance Repair Services in Bangalore",
                    "Pest Control Services in Bangalore",
                    "Home Painting Services in Bangalore",
                    "Carpenter Services in Bangalore",
                    "Sofa & Carpet Cleaning in Bangalore",
                    "Bathroom & Kitchen Cleaning in Bangalore",
                    "RO & Water Purifier Service in Bangalore",
                    "Washing Machine Repair in Bangalore",
                    "Refrigerator Repair in Bangalore",
                    "Geyser Repair & Service in Bangalore",
                    "Handyman Services in Bangalore",
                    "Home Repair & Maintenance in Bangalore",
                    "Home Services Near Me in Bangalore"
                  ].map(keyword => (
                    <Link 
                      key={keyword} 
                      to="/bangalore"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                      {keyword}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched.");
} else {
  console.log("Could not find old code.");
}
