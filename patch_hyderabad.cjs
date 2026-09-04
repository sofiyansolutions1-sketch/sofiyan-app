const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldMumbaiBlock = `              { label: "Home Services Near Me in Mumbai", category: null }
            ]
          };`;

const newHyderabadBlock = `              { label: "Home Services Near Me in Mumbai", category: null }
            ],
            hyderabad: [
              { label: "Home Cleaning Services in Hyderabad", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Hyderabad", category: "Cleaning" },
              { label: "Electrician Services in Hyderabad", category: "Electrician" },
              { label: "Emergency Electrician Services in Hyderabad", category: "Electrician" },
              { label: "Plumber Services in Hyderabad", category: "Plumbing" },
              { label: "Emergency Plumbing & Leakage Repair in Hyderabad", category: "Plumbing" },
              { label: "AC Service & Repair in Hyderabad", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Hyderabad", category: "AC Repair" },
              { label: "Appliance Repair Services in Hyderabad", category: "Appliances" },
              { label: "Washing Machine Repair in Hyderabad", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Hyderabad", category: "Appliances" },
              { label: "Geyser Repair & Service in Hyderabad", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Hyderabad", category: "Appliances" },
              { label: "Pest Control Services in Hyderabad", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Hyderabad", category: "Pest Control" },
              { label: "Carpenter Services in Hyderabad", category: "Carpentry" },
              { label: "Home Painting Services in Hyderabad", category: "Painting" },
              { label: "Waterproofing Services in Hyderabad", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Hyderabad", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Hyderabad", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Hyderabad", category: "Carpentry" },
              { label: "Home Services Near Me in Hyderabad", category: null }
            ]
          };`;

if (content.includes(oldMumbaiBlock)) {
  content = content.replace(oldMumbaiBlock, newHyderabadBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Hyderabad.");
} else {
  console.log("Could not find old code.");
}
