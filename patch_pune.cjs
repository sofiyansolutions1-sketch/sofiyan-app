const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldHyderabadBlock = `              { label: "Home Services Near Me in Hyderabad", category: null }
            ]
          };`;

const newPuneBlock = `              { label: "Home Services Near Me in Hyderabad", category: null }
            ],
            pune: [
              { label: "Home Cleaning Services in Pune", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Pune", category: "Cleaning" },
              { label: "Electrician Services in Pune", category: "Electrician" },
              { label: "Emergency Electrician in Pune", category: "Electrician" },
              { label: "Plumber Services in Pune", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Pune", category: "Plumbing" },
              { label: "AC Service & Repair in Pune", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Pune", category: "AC Repair" },
              { label: "Appliance Repair Services in Pune", category: "Appliances" },
              { label: "Washing Machine Repair in Pune", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Pune", category: "Appliances" },
              { label: "Geyser Repair & Service in Pune", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Pune", category: "Appliances" },
              { label: "Pest Control Services in Pune", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Pune", category: "Pest Control" },
              { label: "Carpenter Services in Pune", category: "Carpentry" },
              { label: "Home Painting Services in Pune", category: "Painting" },
              { label: "Waterproofing Services in Pune", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Pune", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Pune", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Pune", category: "Carpentry" },
              { label: "Home Services Near Me in Pune", category: null }
            ]
          };`;

if (content.includes(oldHyderabadBlock)) {
  content = content.replace(oldHyderabadBlock, newPuneBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Pune.");
} else {
  console.log("Could not find old code.");
}
