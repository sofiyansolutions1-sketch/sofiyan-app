const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon', 'noida', 'varanasi'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon', 'noida', 'varanasi', 'mau'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldVaranasiBlock = `              { label: "Home Services Near Me in Varanasi", category: null }
            ]
          };`;

const newMauBlock = `              { label: "Home Services Near Me in Varanasi", category: null }
            ],
            mau: [
              { label: "Home Cleaning Services in Mau", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Mau", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Mau", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Mau", category: "Cleaning" },
              { label: "Electrician Services in Mau", category: "Electrician" },
              { label: "Emergency Electrician Services in Mau", category: "Electrician" },
              { label: "Plumber Services in Mau", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Mau", category: "Plumbing" },
              { label: "AC Service & Repair in Mau", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Mau", category: "AC Repair" },
              { label: "Appliance Repair Services in Mau", category: "Appliances" },
              { label: "Washing Machine Repair in Mau", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Mau", category: "Appliances" },
              { label: "Geyser Repair & Service in Mau", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Mau", category: "Appliances" },
              { label: "TV & Electronics Repair in Mau", category: "Appliances" },
              { label: "Pest Control Services in Mau", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Mau", category: "Pest Control" },
              { label: "Carpenter Services in Mau", category: "Carpentry" },
              { label: "Home Painting Services in Mau", category: "Painting" },
              { label: "Waterproofing Services in Mau", category: "Painting" },
              { label: "Handyman & Home Maintenance in Mau", category: "Carpentry" },
              { label: "Home Repair Services in Mau", category: "Carpentry" },
              { label: "Home Services Near Me in Mau", category: null }
            ]
          };`;

if (content.includes(oldVaranasiBlock)) {
  content = content.replace(oldVaranasiBlock, newMauBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Mau.");
} else {
  console.log("Could not find old code.");
}
