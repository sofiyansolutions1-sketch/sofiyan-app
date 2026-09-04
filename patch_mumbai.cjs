const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldDelhiBlock = `              { label: "Home Services Near Me in Delhi", category: null }
            ]
          };`;

const newMumbaiBlock = `              { label: "Home Services Near Me in Delhi", category: null }
            ],
            mumbai: [
              { label: "Home Cleaning Services in Mumbai", category: "Cleaning" },
              { label: "Deep Cleaning Services in Mumbai", category: "Cleaning" },
              { label: "Electrician Services in Mumbai", category: "Electrician" },
              { label: "Emergency Electrician in Mumbai", category: "Electrician" },
              { label: "Plumber Services in Mumbai", category: "Plumbing" },
              { label: "Emergency Plumber & Plumbing Repair in Mumbai", category: "Plumbing" },
              { label: "AC Service & Repair in Mumbai", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Mumbai", category: "AC Repair" },
              { label: "Appliance Repair Services in Mumbai", category: "Appliances" },
              { label: "Washing Machine Repair in Mumbai", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Mumbai", category: "Appliances" },
              { label: "Geyser Repair & Service in Mumbai", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Mumbai", category: "Appliances" },
              { label: "Pest Control Services in Mumbai", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Mumbai", category: "Pest Control" },
              { label: "Carpenter Services in Mumbai", category: "Carpentry" },
              { label: "Home Painting Services in Mumbai", category: "Painting" },
              { label: "Waterproofing Services in Mumbai", category: "Painting" },
              { label: "Sofa & Carpet Cleaning in Mumbai", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Mumbai", category: "Cleaning" },
              { label: "Handyman & Home Repair Services in Mumbai", category: "Carpentry" },
              { label: "Home Services Near Me in Mumbai", category: null }
            ]
          };`;

if (content.includes(oldDelhiBlock)) {
  content = content.replace(oldDelhiBlock, newMumbaiBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Mumbai.");
} else {
  console.log("Could not find old code.");
}
