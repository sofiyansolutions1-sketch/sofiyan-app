const fs = require('fs');

const htmlContent = `
          // Add location-specific SEO content for Water Purifier in Varanasi
          if (categoryName === 'WaterPurifier' && localStorage.getItem('preferredCity') === 'Varanasi') {
              const seoDiv = document.createElement('article');
              seoDiv.className = 'mt-12 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200 mx-4 md:mx-0 text-gray-800 font-sans';
              seoDiv.innerHTML = \\\`
                  <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                    Water Purifier Service in Varanasi | Expert RO Repair, Filter Replacement & Water Purification Solutions by Sofiyan
                  </h2>
                  
                  <div class="space-y-5 text-base leading-relaxed">
                    <p>Safe drinking water is essential for maintaining good health and protecting families from waterborne contaminants. In Varanasi, where water quality may vary from one locality to another, properly functioning water purification systems are important for homes, businesses, educational institutions, and healthcare facilities.</p>
                    
                    <p>Regular maintenance helps ensure consistent water quality, improved purification efficiency, and longer equipment lifespan.</p>

                    <p>If you're searching for trusted Water Purifier Services in Varanasi, Sofiyan provides professional doorstep RO repair, maintenance, filter replacement, installation, AMC support, troubleshooting, and complete purification system care for residential and commercial customers.</p>

                    <p>Whether your RO system is leaking, producing bad-tasting water, showing low water flow, generating unusual noises, failing to purify properly, or requiring periodic maintenance, our experienced technicians provide reliable and long-lasting solutions.</p>

                    <p>We offer same-day RO service in Varanasi for homes, apartments, hostels, hotels, hospitals, clinics, schools, colleges, offices, restaurants, guest houses, and commercial establishments.</p>

                    <p>Our specialists service RO Water Purifiers, UV Water Purifiers, UF Systems, RO+UV+UF Systems, Copper RO Systems, Alkaline Water Purifiers, Smart Water Purifiers, Commercial RO Plants, and Industrial Water Treatment Systems.</p>

                    <p>We service all major brands including Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, Eureka Forbes, LG, V-Guard, Aqua Fresh, Aqua Grand, and more.</p>

                    <p>Our services are available across Lanka, Sigra, Bhelupur, Mahmoorganj, Cantt, Pandeypur, Shivpur, Sarnath, Ashapur, Orderly Bazar, Chaukaghat, Ramnagar, DLW, BHU Area, and nearby Varanasi locations.</p>

                    <div class="bg-gray-50 border-l-4 border-indigo-600 p-4 rounded mt-4">
                      <p><strong>Call:</strong> <a href="tel:7625046788" class="text-indigo-600 hover:underline">7625046788</a></p>
                      <p><strong>Website:</strong> <a href="https://sofiyan.com" class="text-indigo-600 hover:underline">sofiyan.com</a></p>
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">RO Service Charges in Varanasi</h3>
                    
                    <h4 class="font-bold text-gray-900">Inspection & Diagnosis</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>RO Inspection & Diagnosis</strong> – Starting from ₹249*</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Repair Services</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>Water Purifier Repair</strong> – Starting from ₹249*</li>
                      <li><strong>RO Troubleshooting</strong> – Affordable Pricing Available</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Filter Replacement Services</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>Sediment Filter Replacement</strong> – Affordable Pricing</li>
                      <li><strong>Carbon Filter Replacement</strong> – Affordable Pricing</li>
                      <li><strong>RO Membrane Replacement</strong> – Custom Pricing</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Installation Services</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>RO Installation</strong> – Starting from ₹449*</li>
                      <li><strong>RO Uninstallation</strong> – Starting from ₹399*</li>
                      <li><strong>RO Relocation Service</strong> – Starting from ₹599*</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Maintenance Services</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>RO Cleaning & Sanitization</strong> – Starting from ₹349*</li>
                      <li><strong>AMC Plans</strong> – Custom Pricing</li>
                      <li><strong>Commercial RO Maintenance</strong> – Site Inspection Based</li>
                    </ul>

                    <p class="text-sm text-gray-500 italic mt-4">Final pricing depends on purifier type, filter condition, spare parts required, and water quality requirements.</p>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Why Varanasi Residents Choose Sofiyan RO Services</h3>
                    <div class="space-y-4">
                      <div>
                        <strong class="block text-gray-900">Same-Day Doorstep Assistance</strong>
                        <p>Fast response for urgent drinking water purification issues.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Water Quality Specialists</strong>
                        <p>Technicians trained to handle high-TDS and hard water purification challenges.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Residential & Commercial Coverage</strong>
                        <p>Services available for homes, hotels, hospitals, educational institutions, and offices.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Genuine Filters & Spare Parts</strong>
                        <p>High-quality replacement parts improve purification efficiency and reliability.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Transparent Pricing</strong>
                        <p>Clear quotations before repair work begins.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Health-Focused Solutions</strong>
                        <p>Services designed to maintain safe and hygienic drinking water standards.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Digital Service Reports</strong>
                        <p>WhatsApp invoices and maintenance records after every service.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Reliable After-Service Support</strong>
                        <p>Dedicated customer assistance after service completion.</p>
                      </div>
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Signs Your Water Purifier Needs Professional Service</h3>
                    <div class="space-y-4">
                      <div>
                        <strong class="block text-gray-900">Low Water Output</strong>
                        <p>Blocked filters or membrane issues may reduce water flow.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Bad Taste or Odor in Water</strong>
                        <p>Filter deterioration can affect purification quality.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Water Leakage Around RO Unit</strong>
                        <p>Loose fittings, damaged pipes, or tank issues may cause leakage.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">High TDS Levels</strong>
                        <p>Purification efficiency may decline over time.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">RO System Not Starting</strong>
                        <p>Electrical faults or pump failures may prevent operation.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Unusual Noise During Operation</strong>
                        <p>Booster pump or internal component problems may create abnormal sounds.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Slow Water Tank Filling</strong>
                        <p>Membrane blockage or pump issues may affect water production speed.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Water Appears Cloudy</strong>
                        <p>Purification systems may require maintenance or filter replacement.</p>
                      </div>
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">RO Problems We Frequently Resolve</h3>
                    <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 list-none pl-0">
                      <li>✓ RO Not Working</li>
                      <li>✓ Low Water Flow Problems</li>
                      <li>✓ Water Leakage Repairs</li>
                      <li>✓ RO Filter Replacement</li>
                      <li>✓ Carbon Filter Replacement</li>
                      <li>✓ Sediment Filter Replacement</li>
                      <li>✓ RO Membrane Replacement</li>
                      <li>✓ UV Lamp Replacement</li>
                      <li>✓ Booster Pump Repair</li>
                      <li>✓ TDS Controller Issues</li>
                      <li>✓ Water Taste Problems</li>
                      <li>✓ Storage Tank Cleaning</li>
                      <li>✓ RO Installation</li>
                      <li>✓ RO Reinstallation</li>
                      <li>✓ Commercial RO Repairs</li>
                      <li>✓ AMC Maintenance Services</li>
                      <li>✓ Electrical Fault Diagnosis</li>
                      <li>✓ Copper RO System Repairs</li>
                      <li>✓ Alkaline Water Purifier Repairs</li>
                      <li>✓ Water Purifier Sanitization</li>
                    </ul>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Our Varanasi RO Service Process</h3>
                    <ol class="list-decimal pl-5 space-y-3">
                      <li><strong>Service Booking:</strong> Book your RO service online or by phone.</li>
                      <li><strong>Technician Assignment:</strong> A nearby Sofiyan technician is assigned according to your location.</li>
                      <li><strong>Complete Inspection:</strong> The purification system is thoroughly inspected.</li>
                      <li><strong>Transparent Estimate:</strong> Repair recommendations and pricing are explained clearly.</li>
                      <li><strong>Repair & Maintenance:</strong> Repairs, cleaning, replacements, or installations are completed professionally.</li>
                      <li><strong>Water Quality Testing:</strong> Purification performance, leakage checks, and water quality parameters are verified.</li>
                      <li><strong>Digital Billing:</strong> Invoices and service reports are delivered instantly via WhatsApp.</li>
                    </ol>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Benefits of Regular RO Maintenance</h3>
                    <p>Routine servicing helps:</p>
                    <ul class="list-disc pl-5 space-y-2">
                       <li>Maintain Safe Drinking Water</li>
                       <li>Improve Purification Efficiency</li>
                       <li>Extend Purifier Lifespan</li>
                       <li>Prevent Unexpected Breakdowns</li>
                       <li>Maintain Proper TDS Levels</li>
                       <li>Improve Water Taste</li>
                       <li>Reduce Future Repair Costs</li>
                       <li>Detect Problems Early</li>
                     </ul>
                     <p class="mt-2">Experts recommend professional RO servicing every 3–6 months, especially in areas with high TDS water.</p>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Frequently Asked Questions</h3>
                    <div class="space-y-4">
                      <div>
                        <strong class="block text-gray-900">What is the starting cost of RO repair in Varanasi?</strong>
                        <p>RO repair services start from ₹249*. Final pricing depends on the issue and replacement parts required.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">How often should RO filters be replaced?</strong>
                        <p>Most filters should be checked every 6 months and replaced according to water quality and usage.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Why is my RO water flow slow?</strong>
                        <p>Slow water flow is commonly caused by clogged filters, membrane blockage, or booster pump issues.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Do you provide RO installation services?</strong>
                        <p>Yes. We provide installation, relocation, reinstallation, and uninstallation support.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Is AMC available for water purifiers?</strong>
                        <p>Yes. We offer annual maintenance plans for residential and commercial systems.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Which purifier brands do you service?</strong>
                        <p>We service Kent, Aquaguard, Livpure, Pureit, AO Smith, Blue Star, Havells, Eureka Forbes, LG, V-Guard, Aqua Fresh, Aqua Grand, and many more.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Do you service commercial RO plants?</strong>
                        <p>Absolutely. We provide repair and maintenance support for commercial and industrial purification systems.</p>
                      </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-gray-200">
                      <h3 class="text-xl font-bold text-gray-900 mb-3">Book Water Purifier Service in Varanasi Today</h3>
                      <p>Whether you need emergency RO repair, membrane replacement, filter replacement, purifier cleaning, installation support, AMC maintenance, or complete water purification system servicing, Sofiyan delivers dependable RO solutions throughout Varanasi.</p>
                      <div class="mt-4 bg-indigo-50 p-4 rounded line-height-loose">
                        <p><strong>Call:</strong> <a href="tel:7625046788" class="text-indigo-700 hover:underline font-bold">7625046788</a></p>
                        <p><strong>Website:</strong> <a href="https://sofiyan.com" class="text-indigo-700 hover:underline">sofiyan.com</a></p>
                        <p><strong>Email:</strong> <a href="mailto:sofiyansolutions1@gmail.com" class="text-indigo-700 hover:underline">sofiyansolutions1@gmail.com</a></p>
                      </div>
                      <p class="mt-4 font-bold text-gray-900">Enjoy safe, healthy, and purified drinking water every day with Varanasi’s trusted RO repair and maintenance experts.</p>
                    </div>
                  </div>
              \\\`;
              content.appendChild(seoDiv);
          }
`;

function insertBeforeString(filePath, anchor, content) {
    let text = fs.readFileSync(filePath, 'utf8');
    text = text.replace(anchor, content + "\\n\\n          " + anchor);
    fs.writeFileSync(filePath, text);
}

const indexAnchor = "// Add location-specific SEO content for Water Purifier in Noida";
insertBeforeString('index.html', indexAnchor, htmlContent);

console.log("Done");
