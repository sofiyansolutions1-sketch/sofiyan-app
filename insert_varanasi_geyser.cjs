const fs = require('fs');

const htmlContent = `
          // Add location-specific SEO content for Geyser in Varanasi
          if (categoryName === 'Geyser' && localStorage.getItem('preferredCity') === 'Varanasi') {
              const seoDiv = document.createElement('article');
              seoDiv.className = 'mt-12 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200 mx-4 md:mx-0 text-gray-800 font-sans';
              seoDiv.innerHTML = \\\`
                  <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                    Geyser Repair Service in Varanasi | Expert Water Heater Repair, Installation & Maintenance by Sofiyan
                  </h2>
                  
                  <div class="space-y-5 text-base leading-relaxed">
                    <p>Hot water is an essential part of daily life, especially during the winter season. Whether it's for bathing, cleaning, hospitality services, healthcare facilities, or commercial operations, a properly functioning geyser ensures comfort, convenience, and efficiency.</p>
                    
                    <p>In Varanasi, where winters can be chilly and water heating systems are heavily used, regular maintenance and timely repairs help prevent unexpected breakdowns and costly replacements.</p>

                    <p>If you're searching for trusted Geyser Repair Services in Varanasi, Sofiyan provides professional doorstep repair, maintenance, installation, troubleshooting, and preventive servicing solutions for all major geyser brands and models.</p>

                    <p>Whether your geyser is not heating water, leaking, tripping the MCB, making unusual noises, consuming excessive electricity, or delivering inconsistent temperatures, our experienced technicians provide dependable and long-lasting repair solutions.</p>

                    <p>We offer same-day geyser service in Varanasi for homes, apartments, hostels, hotels, guest houses, hospitals, clinics, salons, gyms, offices, and commercial establishments.</p>

                    <p>Our specialists repair and service Instant Geysers, Storage Water Heaters, Vertical Geysers, Horizontal Geysers, Smart Geysers, Electric Water Heaters, Solar Water Heating Support Systems, and Commercial Water Heating Units.</p>

                    <p>We service all major brands including Racold, AO Smith, Havells, Bajaj, Crompton, V-Guard, Venus, Usha, Orient, Kenstar, Jaquar, Longway, Maharaja Whiteline, and more.</p>

                    <p>Our services are available across Lanka, Sigra, Bhelupur, Mahmoorganj, Cantt, Pandeypur, Shivpur, Sarnath, Ashapur, Orderly Bazar, Chaukaghat, Ramnagar, DLW, BHU Area, and nearby Varanasi locations.</p>

                    <div class="bg-gray-50 border-l-4 border-indigo-600 p-4 rounded mt-4">
                      <p><strong>Call:</strong> <a href="tel:9219345455" class="text-indigo-600 hover:underline">9219345455</a></p>
                      <p><strong>Website:</strong> <a href="https://sofiyan.com" class="text-indigo-600 hover:underline">sofiyan.com</a></p>
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Geyser Service Charges in Varanasi</h3>
                    
                    <h4 class="font-bold text-gray-900">Inspection & Diagnosis</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>Geyser Inspection & Diagnosis</strong> – Starting from ₹299*</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Repair Services</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>Geyser Repair Service</strong> – Starting from ₹299*</li>
                      <li><strong>Water Heater Troubleshooting</strong> – Affordable Pricing Available</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Component Replacement</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>Heating Element Replacement</strong> – Custom Pricing</li>
                      <li><strong>Thermostat Replacement</strong> – Affordable Pricing</li>
                      <li><strong>Safety Valve Replacement</strong> – Inspection Based</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Installation Services</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>Geyser Installation</strong> – Starting from ₹499*</li>
                      <li><strong>Geyser Uninstallation</strong> – Starting from ₹399*</li>
                      <li><strong>Geyser Relocation Service</strong> – Starting from ₹699*</li>
                    </ul>

                    <h4 class="font-bold text-gray-900">Maintenance Services</h4>
                    <ul class="list-disc pl-5 space-y-2 mb-4">
                      <li><strong>Geyser Cleaning & Descaling</strong> – Starting from ₹349*</li>
                      <li><strong>Preventive Maintenance Plans</strong> – Custom Pricing</li>
                    </ul>

                    <p class="text-sm text-gray-500 italic mt-4">Final pricing depends on geyser type, spare parts required, and repair complexity.</p>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Why Varanasi Residents Choose Sofiyan Geyser Services</h3>
                    <div class="space-y-4">
                      <div>
                        <strong class="block text-gray-900">Same-Day Doorstep Support</strong>
                        <p>Quick assistance for urgent hot water problems.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Winter Season Specialists</strong>
                        <p>Solutions designed for heavy seasonal geyser usage and water heating requirements.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Residential & Commercial Coverage</strong>
                        <p>Services available for homes, hotels, hospitals, hostels, salons, gyms, and offices.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Genuine Spare Parts</strong>
                        <p>High-quality replacement components improve durability and heating performance.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Transparent Pricing</strong>
                        <p>Clear quotations before service begins.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Safety-Focused Repairs</strong>
                        <p>Every electrical and heating component is carefully inspected.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Digital Service Reports</strong>
                        <p>WhatsApp invoices and maintenance records provided after service.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Reliable After-Service Support</strong>
                        <p>Dedicated customer support after repair completion.</p>
                      </div>
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Signs Your Geyser Needs Professional Repair</h3>
                    <div class="space-y-4">
                      <div>
                        <strong class="block text-gray-900">Water Is Not Heating Properly</strong>
                        <p>Heating element or thermostat failures may affect performance.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Water Leakage from Geyser</strong>
                        <p>Tank corrosion, loose fittings, or valve issues may cause leakage.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">MCB Trips Frequently</strong>
                        <p>Electrical faults or internal short circuits may create safety concerns.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Temperature Fluctuations</strong>
                        <p>Thermostat problems may result in inconsistent heating.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Unusual Sounds During Operation</strong>
                        <p>Sediment buildup inside the tank may reduce efficiency.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Rust-Colored Water</strong>
                        <p>Internal tank corrosion may affect water quality.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Increased Electricity Bills</strong>
                        <p>An inefficient heating system may consume more power than normal.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Slow Water Heating</strong>
                        <p>Heating elements may require repair or replacement.</p>
                      </div>
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Geyser Problems We Frequently Resolve</h3>
                    <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 list-none pl-0">
                      <li>✓ Geyser Not Heating Water</li>
                      <li>✓ Heating Element Replacement</li>
                      <li>✓ Thermostat Repair</li>
                      <li>✓ Water Leakage Repair</li>
                      <li>✓ Instant Geyser Repairs</li>
                      <li>✓ Storage Geyser Repairs</li>
                      <li>✓ Safety Valve Replacement</li>
                      <li>✓ MCB Tripping Issues</li>
                      <li>✓ Internal Wiring Faults</li>
                      <li>✓ Temperature Control Problems</li>
                      <li>✓ Indicator Light Failures</li>
                      <li>✓ Tank Cleaning & Descaling</li>
                      <li>✓ Water Heater Repairs</li>
                      <li>✓ Geyser Installation</li>
                      <li>✓ Geyser Reinstallation</li>
                      <li>✓ Geyser Relocation</li>
                      <li>✓ Smart Geyser Troubleshooting</li>
                      <li>✓ Electrical Safety Inspections</li>
                      <li>✓ Commercial Water Heater Repairs</li>
                      <li>✓ Preventive Maintenance Services</li>
                    </ul>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Our Varanasi Geyser Service Process</h3>
                    <ol class="list-decimal pl-5 space-y-3">
                      <li><strong>Service Booking:</strong> Book your geyser service online or by phone.</li>
                      <li><strong>Technician Assignment:</strong> A nearby Sofiyan technician is assigned according to your location.</li>
                      <li><strong>Complete Inspection:</strong> The geyser is thoroughly inspected to identify the root cause of the problem.</li>
                      <li><strong>Transparent Estimate:</strong> Repair recommendations and pricing are explained clearly.</li>
                      <li><strong>Repair & Maintenance:</strong> Repairs, cleaning, replacements, or installations are completed professionally.</li>
                      <li><strong>Safety & Performance Testing:</strong> Heating efficiency, electrical safety, leakage checks, and thermostat operation are verified.</li>
                      <li><strong>Digital Billing:</strong> Invoices and service reports are delivered instantly through WhatsApp.</li>
                    </ol>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Benefits of Regular Geyser Maintenance</h3>
                    <p>Routine maintenance helps:</p>
                    <ul class="list-disc pl-5 space-y-2">
                       <li>Improve Heating Efficiency</li>
                       <li>Reduce Electricity Consumption</li>
                       <li>Extend Appliance Lifespan</li>
                       <li>Prevent Unexpected Breakdowns</li>
                       <li>Improve Water Quality</li>
                       <li>Reduce Scale Build-Up</li>
                       <li>Detect Problems Early</li>
                       <li>Ensure Safe Operation</li>
                     </ul>
                     <p class="mt-2">Experts recommend professional servicing every 6–12 months, especially before winter begins.</p>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Frequently Asked Questions</h3>
                    <div class="space-y-4">
                      <div>
                        <strong class="block text-gray-900">What is the starting cost of geyser repair in Varanasi?</strong>
                        <p>Geyser repair services start from ₹299*. Final pricing depends on the issue and spare parts required.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Why is my geyser not heating water?</strong>
                        <p>Common causes include heating element failure, thermostat faults, electrical issues, or sediment buildup.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Do you repair instant geysers?</strong>
                        <p>Yes. We repair instant geysers, storage water heaters, smart geysers, and commercial heating systems.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Do you provide geyser installation services?</strong>
                        <p>Absolutely. We provide installation, relocation, reinstallation, and uninstallation support.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Is service warranty available?</strong>
                        <p>Selected repairs include a 5–15 day service warranty and revisit support.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">Which geyser brands do you repair?</strong>
                        <p>We service Racold, AO Smith, Havells, Bajaj, Crompton, V-Guard, Venus, Usha, Orient, Kenstar, Jaquar, Longway, and many others.</p>
                      </div>
                      <div>
                        <strong class="block text-gray-900">How often should a geyser be serviced?</strong>
                        <p>Professional maintenance every 6–12 months helps improve efficiency and extend appliance lifespan.</p>
                      </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-gray-200">
                      <h3 class="text-xl font-bold text-gray-900 mb-3">Book Geyser Repair Service in Varanasi Today</h3>
                      <p>Whether you need emergency geyser repairs, thermostat replacement, heating element replacement, installation support, leakage repairs, or preventive maintenance, Sofiyan delivers dependable water heater solutions throughout Varanasi.</p>
                      <div class="mt-4 bg-indigo-50 p-4 rounded line-height-loose">
                        <p><strong>Call:</strong> <a href="tel:9219345455" class="text-indigo-700 hover:underline font-bold">9219345455</a></p>
                        <p><strong>Website:</strong> <a href="https://sofiyan.com" class="text-indigo-700 hover:underline">sofiyan.com</a></p>
                        <p><strong>Email:</strong> <a href="mailto:sofiyansolutions1@gmail.com" class="text-indigo-700 hover:underline">sofiyansolutions1@gmail.com</a></p>
                      </div>
                      <p class="mt-4 font-bold text-gray-900">Enjoy reliable hot water and energy-efficient performance with Varanasi’s trusted geyser repair and maintenance experts.</p>
                    </div>
                  </div>
              \\\`;
              content.appendChild(seoDiv);
          }
`;

const tsxContent = `
            {selectedService?.name === 'Geyser' && localStorage.getItem('preferredCity') === 'Varanasi' && (
              <article className="mt-12 bg-white text-gray-800 font-sans border-t pt-8 border-gray-100">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                  Geyser Repair Service in Varanasi | Expert Water Heater Repair, Installation & Maintenance by Sofiyan
                </h2>
                
                <div className="space-y-5 text-sm md:text-base leading-relaxed">
                  <p>Hot water is an essential part of daily life, especially during the winter season. Whether it's for bathing, cleaning, hospitality services, healthcare facilities, or commercial operations, a properly functioning geyser ensures comfort, convenience, and efficiency.</p>
                  
                  <p>In Varanasi, where winters can be chilly and water heating systems are heavily used, regular maintenance and timely repairs help prevent unexpected breakdowns and costly replacements.</p>

                  <p>If you're searching for trusted Geyser Repair Services in Varanasi, Sofiyan provides professional doorstep repair, maintenance, installation, troubleshooting, and preventive servicing solutions for all major geyser brands and models.</p>

                  <p>Whether your geyser is not heating water, leaking, tripping the MCB, making unusual noises, consuming excessive electricity, or delivering inconsistent temperatures, our experienced technicians provide dependable and long-lasting repair solutions.</p>

                  <p>We offer same-day geyser service in Varanasi for homes, apartments, hostels, hotels, guest houses, hospitals, clinics, salons, gyms, offices, and commercial establishments.</p>

                  <p>Our specialists repair and service Instant Geysers, Storage Water Heaters, Vertical Geysers, Horizontal Geysers, Smart Geysers, Electric Water Heaters, Solar Water Heating Support Systems, and Commercial Water Heating Units.</p>

                  <p>We service all major brands including Racold, AO Smith, Havells, Bajaj, Crompton, V-Guard, Venus, Usha, Orient, Kenstar, Jaquar, Longway, Maharaja Whiteline, and more.</p>

                  <p>Our services are available across Lanka, Sigra, Bhelupur, Mahmoorganj, Cantt, Pandeypur, Shivpur, Sarnath, Ashapur, Orderly Bazar, Chaukaghat, Ramnagar, DLW, BHU Area, and nearby Varanasi locations.</p>

                  <div className="bg-gray-50 border-l-4 border-indigo-600 p-4 rounded mt-4">
                    <p><strong>Call:</strong> <a href="tel:9219345455" className="text-indigo-600 hover:underline">9219345455</a></p>
                    <p><strong>Website:</strong> <a href="https://sofiyan.com" className="text-indigo-600 hover:underline">sofiyan.com</a></p>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Geyser Service Charges in Varanasi</h3>
                  
                  <h4 className="font-bold text-gray-900">Inspection & Diagnosis</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Geyser Inspection & Diagnosis</strong> – Starting from ₹299*</li>
                  </ul>

                  <h4 className="font-bold text-gray-900">Repair Services</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Geyser Repair Service</strong> – Starting from ₹299*</li>
                    <li><strong>Water Heater Troubleshooting</strong> – Affordable Pricing Available</li>
                  </ul>

                  <h4 className="font-bold text-gray-900">Component Replacement</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Heating Element Replacement</strong> – Custom Pricing</li>
                    <li><strong>Thermostat Replacement</strong> – Affordable Pricing</li>
                    <li><strong>Safety Valve Replacement</strong> – Inspection Based</li>
                  </ul>

                  <h4 className="font-bold text-gray-900">Installation Services</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Geyser Installation</strong> – Starting from ₹499*</li>
                    <li><strong>Geyser Uninstallation</strong> – Starting from ₹399*</li>
                    <li><strong>Geyser Relocation Service</strong> – Starting from ₹699*</li>
                  </ul>

                  <h4 className="font-bold text-gray-900">Maintenance Services</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Geyser Cleaning & Descaling</strong> – Starting from ₹349*</li>
                    <li><strong>Preventive Maintenance Plans</strong> – Custom Pricing</li>
                  </ul>

                  <p className="text-sm text-gray-500 italic mt-4">Final pricing depends on geyser type, spare parts required, and repair complexity.</p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Why Varanasi Residents Choose Sofiyan Geyser Services</h3>
                  <div className="space-y-4">
                    <div>
                      <strong className="block text-gray-900">Same-Day Doorstep Support</strong>
                      <p>Quick assistance for urgent hot water problems.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Winter Season Specialists</strong>
                      <p>Solutions designed for heavy seasonal geyser usage and water heating requirements.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Residential & Commercial Coverage</strong>
                      <p>Services available for homes, hotels, hospitals, hostels, salons, gyms, and offices.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Genuine Spare Parts</strong>
                      <p>High-quality replacement components improve durability and heating performance.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Transparent Pricing</strong>
                      <p>Clear quotations before service begins.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Safety-Focused Repairs</strong>
                      <p>Every electrical and heating component is carefully inspected.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Digital Service Reports</strong>
                      <p>WhatsApp invoices and maintenance records provided after service.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Reliable After-Service Support</strong>
                      <p>Dedicated customer support after repair completion.</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Signs Your Geyser Needs Professional Repair</h3>
                  <div className="space-y-4">
                    <div>
                      <strong className="block text-gray-900">Water Is Not Heating Properly</strong>
                      <p>Heating element or thermostat failures may affect performance.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Water Leakage from Geyser</strong>
                      <p>Tank corrosion, loose fittings, or valve issues may cause leakage.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">MCB Trips Frequently</strong>
                      <p>Electrical faults or internal short circuits may create safety concerns.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Temperature Fluctuations</strong>
                      <p>Thermostat problems may result in inconsistent heating.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Unusual Sounds During Operation</strong>
                      <p>Sediment buildup inside the tank may reduce efficiency.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Rust-Colored Water</strong>
                      <p>Internal tank corrosion may affect water quality.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Increased Electricity Bills</strong>
                      <p>An inefficient heating system may consume more power than normal.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Slow Water Heating</strong>
                      <p>Heating elements may require repair or replacement.</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Geyser Problems We Frequently Resolve</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none pl-0">
                    <li>✓ Geyser Not Heating Water</li>
                    <li>✓ Heating Element Replacement</li>
                    <li>✓ Thermostat Repair</li>
                    <li>✓ Water Leakage Repair</li>
                    <li>✓ Instant Geyser Repairs</li>
                    <li>✓ Storage Geyser Repairs</li>
                    <li>✓ Safety Valve Replacement</li>
                    <li>✓ MCB Tripping Issues</li>
                    <li>✓ Internal Wiring Faults</li>
                    <li>✓ Temperature Control Problems</li>
                    <li>✓ Indicator Light Failures</li>
                    <li>✓ Tank Cleaning & Descaling</li>
                    <li>✓ Water Heater Repairs</li>
                    <li>✓ Geyser Installation</li>
                    <li>✓ Geyser Reinstallation</li>
                    <li>✓ Geyser Relocation</li>
                    <li>✓ Smart Geyser Troubleshooting</li>
                    <li>✓ Electrical Safety Inspections</li>
                    <li>✓ Commercial Water Heater Repairs</li>
                    <li>✓ Preventive Maintenance Services</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Our Varanasi Geyser Service Process</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li><strong>Service Booking:</strong> Book your geyser service online or by phone.</li>
                    <li><strong>Technician Assignment:</strong> A nearby Sofiyan technician is assigned according to your location.</li>
                    <li><strong>Complete Inspection:</strong> The geyser is thoroughly inspected to identify the root cause of the problem.</li>
                    <li><strong>Transparent Estimate:</strong> Repair recommendations and pricing are explained clearly.</li>
                    <li><strong>Repair & Maintenance:</strong> Repairs, cleaning, replacements, or installations are completed professionally.</li>
                    <li><strong>Safety & Performance Testing:</strong> Heating efficiency, electrical safety, leakage checks, and thermostat operation are verified.</li>
                    <li><strong>Digital Billing:</strong> Invoices and service reports are delivered instantly through WhatsApp.</li>
                  </ol>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Benefits of Regular Geyser Maintenance</h3>
                  <p>Routine maintenance helps:</p>
                  <ul className="list-disc pl-5 space-y-2">
                     <li>Improve Heating Efficiency</li>
                     <li>Reduce Electricity Consumption</li>
                     <li>Extend Appliance Lifespan</li>
                     <li>Prevent Unexpected Breakdowns</li>
                     <li>Improve Water Quality</li>
                     <li>Reduce Scale Build-Up</li>
                     <li>Detect Problems Early</li>
                     <li>Ensure Safe Operation</li>
                   </ul>
                   <p className="mt-2">Experts recommend professional servicing every 6–12 months, especially before winter begins.</p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <strong className="block text-gray-900">What is the starting cost of geyser repair in Varanasi?</strong>
                      <p>Geyser repair services start from ₹299*. Final pricing depends on the issue and spare parts required.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Why is my geyser not heating water?</strong>
                      <p>Common causes include heating element failure, thermostat faults, electrical issues, or sediment buildup.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Do you repair instant geysers?</strong>
                      <p>Yes. We repair instant geysers, storage water heaters, smart geysers, and commercial heating systems.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Do you provide geyser installation services?</strong>
                      <p>Absolutely. We provide installation, relocation, reinstallation, and uninstallation support.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Is service warranty available?</strong>
                      <p>Selected repairs include a 5–15 day service warranty and revisit support.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">Which geyser brands do you repair?</strong>
                      <p>We service Racold, AO Smith, Havells, Bajaj, Crompton, V-Guard, Venus, Usha, Orient, Kenstar, Jaquar, Longway, and many others.</p>
                    </div>
                    <div>
                      <strong className="block text-gray-900">How often should a geyser be serviced?</strong>
                      <p>Professional maintenance every 6–12 months helps improve efficiency and extend appliance lifespan.</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Book Geyser Repair Service in Varanasi Today</h3>
                    <p>Whether you need emergency geyser repairs, thermostat replacement, heating element replacement, installation support, leakage repairs, or preventive maintenance, Sofiyan delivers dependable water heater solutions throughout Varanasi.</p>
                    <div className="mt-4 bg-indigo-50 p-4 rounded line-height-loose">
                      <p><strong>Call:</strong> <a href="tel:9219345455" className="text-indigo-700 hover:underline font-bold">9219345455</a></p>
                      <p><strong>Website:</strong> <a href="https://sofiyan.com" className="text-indigo-700 hover:underline">sofiyan.com</a></p>
                      <p><strong>Email:</strong> <a href="mailto:sofiyansolutions1@gmail.com" className="text-indigo-700 hover:underline">sofiyansolutions1@gmail.com</a></p>
                    </div>
                    <p className="mt-4 font-bold text-gray-900">Enjoy reliable hot water and energy-efficient performance with Varanasi’s trusted geyser repair and maintenance experts.</p>
                  </div>
                </div>
              </article>
            )}
`;

function insertBeforeString(filePath, anchor, content) {
    let text = fs.readFileSync(filePath, 'utf8');
    text = text.replace(anchor, content + "\\n\\n          " + anchor);
    fs.writeFileSync(filePath, text);
}

// For index.html
const indexAnchor = "if (categoryName === 'Geyser' && localStorage.getItem('preferredCity') === 'Noida') {";
insertBeforeString('index.html', indexAnchor, htmlContent);

// For pages/CustomerPanel.tsx
const tsxAnchor = "{selectedService?.name === 'Geyser' && localStorage.getItem('preferredCity') === 'Noida'";
function insertBeforeStringTsx(filePath, anchor, content) {
    let text = fs.readFileSync(filePath, 'utf8');
    text = text.replace(anchor, content + "\\n\\n                        " + anchor);
    fs.writeFileSync(filePath, text);
}
insertBeforeStringTsx('pages/CustomerPanel.tsx', tsxAnchor, tsxContent);

console.log("Done");
