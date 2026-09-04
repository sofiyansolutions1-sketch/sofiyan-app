const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon', 'noida'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon', 'noida', 'varanasi'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldNoidaBlock = `              { label: "Home Services Near Me in Noida", category: null }
            ]
          };`;

const newVaranasiBlock = `              { label: "Home Services Near Me in Noida", category: null }
            ],
            varanasi: [
              { label: "Home Cleaning Services in Varanasi", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Varanasi", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Varanasi", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Varanasi", category: "Cleaning" },
              { label: "Electrician Services in Varanasi", category: "Electrician" },
              { label: "Emergency Electrician Services in Varanasi", category: "Electrician" },
              { label: "Plumber Services in Varanasi", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Varanasi", category: "Plumbing" },
              { label: "AC Service & Repair in Varanasi", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Varanasi", category: "AC Repair" },
              { label: "Appliance Repair Services in Varanasi", category: "Appliances" },
              { label: "Washing Machine Repair in Varanasi", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Varanasi", category: "Appliances" },
              { label: "Geyser Repair & Service in Varanasi", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Varanasi", category: "Appliances" },
              { label: "TV & Electronics Repair in Varanasi", category: "Appliances" },
              { label: "Pest Control Services in Varanasi", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Varanasi", category: "Pest Control" },
              { label: "Carpenter Services in Varanasi", category: "Carpentry" },
              { label: "Home Painting Services in Varanasi", category: "Painting" },
              { label: "Waterproofing Services in Varanasi", category: "Painting" },
              { label: "Handyman & Home Repair Services in Varanasi", category: "Carpentry" },
              { label: "Home Services Near Me in Varanasi", category: null }
            ]
          };`;

if (content.includes(oldNoidaBlock)) {
  content = content.replace(oldNoidaBlock, newVaranasiBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Varanasi.");
} else {
  console.log("Could not find old code.");
}
