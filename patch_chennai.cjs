const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldPuneBlock = `              { label: "Home Services Near Me in Pune", category: null }
            ]
          };`;

const newChennaiBlock = `              { label: "Home Services Near Me in Pune", category: null }
            ],
            chennai: [
              { label: "Home Cleaning Services in Chennai", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Chennai", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Chennai", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Chennai", category: "Cleaning" },
              { label: "Electrician Services in Chennai", category: "Electrician" },
              { label: "Emergency Electrician Services in Chennai", category: "Electrician" },
              { label: "Plumber Services in Chennai", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Chennai", category: "Plumbing" },
              { label: "AC Service & Repair in Chennai", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Chennai", category: "AC Repair" },
              { label: "Appliance Repair Services in Chennai", category: "Appliances" },
              { label: "Washing Machine Repair in Chennai", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Chennai", category: "Appliances" },
              { label: "Geyser Repair & Service in Chennai", category: "Appliances" },
              { label: "RO & Water Purifier Service in Chennai", category: "Appliances" },
              { label: "TV & Electronics Repair in Chennai", category: "Appliances" },
              { label: "Chimney Repair & Service in Chennai", category: "Appliances" },
              { label: "Pest Control Services in Chennai", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Chennai", category: "Pest Control" },
              { label: "Carpenter Services in Chennai", category: "Carpentry" },
              { label: "Home Painting Services in Chennai", category: "Painting" },
              { label: "Waterproofing Services in Chennai", category: "Painting" },
              { label: "Handyman & Home Repair Services in Chennai", category: "Carpentry" },
              { label: "Home Services Near Me in Chennai", category: null }
            ]
          };`;

if (content.includes(oldPuneBlock)) {
  content = content.replace(oldPuneBlock, newChennaiBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Chennai.");
} else {
  console.log("Could not find old code.");
}
