const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const searchStr = '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Water Purifier Service Pricing in Mumbai</h3>';
const idx = html.lastIndexOf(searchStr);
if (idx > 0) {
   html = html.substring(0, idx);
   const endPart = `                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Water Purifier Service Pricing in Mumbai</h3>
                    <ul class="list-disc pl-5 space-y-2">
                      <li><strong>Water Purifier Inspection & Repair</strong> – Starting from ₹249*</li>
                      <li><strong>Filter Check-up</strong> – Starting from ₹249*</li>
                      <li><strong>Filter Replacement</strong> – Affordable Pricing Available</li>
                      <li><strong>RO Installation</strong> – Starting from ₹449*</li>
                      <li><strong>RO Uninstallation</strong> – Starting from ₹399*</li>
                      <li><strong>Tank Cleaning</strong> – Starting from ₹349*</li>
                      <li><strong>AMC / Annual Maintenance</strong> – Custom Pricing Available</li>
                    </ul>
                    <p class="text-sm text-gray-500 italic">Transparent pricing with no hidden charges.</p>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">Why Choose Sofiyan for Water Purifier Service in Mumbai?</h3>
                    <ul class="space-y-3">
                      <li>★ <strong>Same-Day Doorstep Service</strong> across Mumbai</li>
                      <li>★ <strong>Verified & Experienced Technicians</strong></li>
                      <li>★ <strong>Transparent Pricing Before Work Begins</strong></li>
                      <li>★ <strong>Support for All Major RO, UV, UF, and RO+UV Models</strong></li>
                      <li>★ <strong>Genuine Filters & Spare Parts for Better Performance</strong></li>
                      <li>★ <strong>Quick Diagnosis & Efficient Repairs</strong></li>
                      <li>★ <strong>5–15 Days Service Warranty</strong> on applicable services</li>
                      <li>★ <strong>WhatsApp Bills & Digital Service Records</strong></li>
                      <li>★ <strong>Dedicated After-Service Support</strong></li>
                      <li>★ <strong>One Call – Multiple Solutions</strong> under one trusted brand</li>
                    </ul>

                    <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">When Does Your Water Purifier Need Service?</h3>
                    <div class="space-y-4">
                      <div>
                        <strong class="block text-gray-900">Low Water Flow</strong>
                        <p>If your purifier is giving very slow water output</p>
                      </div>
                    </div>
                  </div>
              \`;
              content.appendChild(seoDiv);
          }
      };
    </script>
  </body>
</html>
`;
   fs.writeFileSync('index.html', html + endPart);
}
