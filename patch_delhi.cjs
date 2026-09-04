const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCode = `        {/* Quick Links Section */}
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
                    { label: "Home Cleaning Services in Bangalore", category: "Cleaning" },
                    { label: "Electrician Services in Bangalore", category: "Electrician" },
                    { label: "Plumber Services in Bangalore", category: "Plumbing" },
                    { label: "AC Service & Repair in Bangalore", category: "AC Repair" },
                    { label: "Appliance Repair Services in Bangalore", category: "Appliances" },
                    { label: "Pest Control Services in Bangalore", category: "Pest Control" },
                    { label: "Home Painting Services in Bangalore", category: "Painting" },
                    { label: "Carpenter Services in Bangalore", category: "Carpentry" },
                    { label: "Sofa & Carpet Cleaning in Bangalore", category: "Cleaning" },
                    { label: "Bathroom & Kitchen Cleaning in Bangalore", category: "Cleaning" },
                    { label: "RO & Water Purifier Service in Bangalore", category: "Appliances" },
                    { label: "Washing Machine Repair in Bangalore", category: "Appliances" },
                    { label: "Refrigerator Repair in Bangalore", category: "Appliances" },
                    { label: "Geyser Repair & Service in Bangalore", category: "Appliances" },
                    { label: "Handyman Services in Bangalore", category: "Carpentry" },
                    { label: "Home Repair & Maintenance in Bangalore", category: "Cleaning" },
                    { label: "Home Services Near Me in Bangalore", category: null }
                  ].map(item => (
                    <Link 
                      key={item.label} 
                      to="/bangalore"
                      onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (item.category) {
                          if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                            (window as any).openCategoryView(item.category);
                          } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                            (window as any).openCategoryModal(item.category);
                          } else {
                            const targetService = SERVICES.find(s => s.name === item.category);
                            if (targetService) {
                              setSelectedService(targetService);
                            }
                          }
                        }
                      }}
                      className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}`;

const newCode = `        {/* Quick Links Section */}
        {['bangalore', 'delhi'].includes(activeCity.toLowerCase()) && (() => {
          const seoKeywords = {
            bangalore: [
              { label: "Home Cleaning Services in Bangalore", category: "Cleaning" },
              { label: "Electrician Services in Bangalore", category: "Electrician" },
              { label: "Plumber Services in Bangalore", category: "Plumbing" },
              { label: "AC Service & Repair in Bangalore", category: "AC Repair" },
              { label: "Appliance Repair Services in Bangalore", category: "Appliances" },
              { label: "Pest Control Services in Bangalore", category: "Pest Control" },
              { label: "Home Painting Services in Bangalore", category: "Painting" },
              { label: "Carpenter Services in Bangalore", category: "Carpentry" },
              { label: "Sofa & Carpet Cleaning in Bangalore", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Bangalore", category: "Cleaning" },
              { label: "RO & Water Purifier Service in Bangalore", category: "Appliances" },
              { label: "Washing Machine Repair in Bangalore", category: "Appliances" },
              { label: "Refrigerator Repair in Bangalore", category: "Appliances" },
              { label: "Geyser Repair & Service in Bangalore", category: "Appliances" },
              { label: "Handyman Services in Bangalore", category: "Carpentry" },
              { label: "Home Repair & Maintenance in Bangalore", category: "Cleaning" },
              { label: "Home Services Near Me in Bangalore", category: null }
            ],
            delhi: [
              { label: "Home Cleaning Services in Delhi", category: "Cleaning" },
              { label: "Deep Cleaning Services in Delhi", category: "Cleaning" },
              { label: "Electrician Services in Delhi", category: "Electrician" },
              { label: "Plumber Services in Delhi", category: "Plumbing" },
              { label: "Emergency Plumber in Delhi", category: "Plumbing" },
              { label: "AC Service & Repair in Delhi", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Delhi", category: "AC Repair" },
              { label: "Appliance Repair Services in Delhi", category: "Appliances" },
              { label: "Washing Machine Repair in Delhi", category: "Appliances" },
              { label: "Refrigerator Repair in Delhi", category: "Appliances" },
              { label: "Geyser Repair & Service in Delhi", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Delhi", category: "Appliances" },
              { label: "Pest Control Services in Delhi", category: "Pest Control" },
              { label: "Carpenter Services in Delhi", category: "Carpentry" },
              { label: "Home Painting Services in Delhi", category: "Painting" },
              { label: "Waterproofing Services in Delhi", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Delhi", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Delhi", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Delhi", category: "Carpentry" },
              { label: "Home Services Near Me in Delhi", category: null }
            ]
          };
          const currentKeywords = (seoKeywords as any)[activeCity.toLowerCase()];

          return (
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

                {currentKeywords && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                      Other Services We Offer in {activeCity}
                    </h3>
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      {currentKeywords.map((item: any) => (
                        <Link 
                          key={item.label} 
                          to={\`/\${activeCity.toLowerCase()}\`}
                          onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            if (item.category) {
                              if (typeof window !== 'undefined' && (window as any).openCategoryView) {
                                (window as any).openCategoryView(item.category);
                              } else if (typeof window !== 'undefined' && (window as any).openCategoryModal) {
                                (window as any).openCategoryModal(item.category);
                              } else {
                                const targetService = SERVICES.find(s => s.name === item.category);
                                if (targetService) {
                                  setSelectedService(targetService);
                                }
                              }
                            }
                          }}
                          className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Delhi and Bangalore.");
} else {
  console.log("Could not find old code.");
}
