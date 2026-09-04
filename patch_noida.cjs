const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon', 'noida'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldGurgaonBlock = `              { label: "Home Services Near Me in Gurgaon", category: null }
            ]
          };`;

const newNoidaBlock = `              { label: "Home Services Near Me in Gurgaon", category: null }
            ],
            noida: [
              { label: "Home Cleaning Services in Noida", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Noida", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Noida", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Noida", category: "Cleaning" },
              { label: "Electrician Services in Noida", category: "Electrician" },
              { label: "Emergency Electrician Services in Noida", category: "Electrician" },
              { label: "Plumber Services in Noida", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Noida", category: "Plumbing" },
              { label: "AC Service & Repair in Noida", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Noida", category: "AC Repair" },
              { label: "Appliance Repair Services in Noida", category: "Appliances" },
              { label: "Washing Machine Repair in Noida", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Noida", category: "Appliances" },
              { label: "Geyser Repair & Service in Noida", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Noida", category: "Appliances" },
              { label: "TV & Electronics Repair in Noida", category: "Appliances" },
              { label: "Pest Control Services in Noida", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Noida", category: "Pest Control" },
              { label: "Carpenter Services in Noida", category: "Carpentry" },
              { label: "Home Painting Services in Noida", category: "Painting" },
              { label: "Waterproofing Services in Noida", category: "Painting" },
              { label: "Handyman & Home Repair Services in Noida", category: "Carpentry" },
              { label: "Home Services Near Me in Noida", category: null }
            ]
          };`;

if (content.includes(oldGurgaonBlock)) {
  content = content.replace(oldGurgaonBlock, newNoidaBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Noida.");
} else {
  console.log("Could not find old code.");
}
