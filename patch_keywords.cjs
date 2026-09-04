const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldArray = `                  {[
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
                  ))}`;

const newArray = `                  {[
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
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (item.category) {
                          const targetService = SERVICES.find(s => s.name === item.category);
                          if (targetService) {
                            setSelectedService(targetService);
                          }
                        }
                      }}
                      className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 text-[15px] transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
                      {item.label}
                    </Link>
                  ))}`;

if (content.includes(oldArray)) {
  content = content.replace(oldArray, newArray);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log('Successfully patched keywords');
} else {
  console.log('Failed to find old code block');
}
