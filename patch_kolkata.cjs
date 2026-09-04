const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldChennaiBlock = `              { label: "Home Services Near Me in Chennai", category: null }
            ]
          };`;

const newKolkataBlock = `              { label: "Home Services Near Me in Chennai", category: null }
            ],
            kolkata: [
              { label: "Home Cleaning Services in Kolkata", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Kolkata", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Kolkata", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Kolkata", category: "Cleaning" },
              { label: "Electrician Services in Kolkata", category: "Electrician" },
              { label: "Emergency Electrician Services in Kolkata", category: "Electrician" },
              { label: "Plumber Services in Kolkata", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Kolkata", category: "Plumbing" },
              { label: "AC Service & Repair in Kolkata", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Kolkata", category: "AC Repair" },
              { label: "Appliance Repair Services in Kolkata", category: "Appliances" },
              { label: "Washing Machine Repair in Kolkata", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Kolkata", category: "Appliances" },
              { label: "Geyser Repair & Service in Kolkata", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Kolkata", category: "Appliances" },
              { label: "Microwave & TV Repair Services in Kolkata", category: "Appliances" },
              { label: "Pest Control Services in Kolkata", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Kolkata", category: "Pest Control" },
              { label: "Carpenter Services in Kolkata", category: "Carpentry" },
              { label: "Home Painting Services in Kolkata", category: "Painting" },
              { label: "Waterproofing Services in Kolkata", category: "Painting" },
              { label: "Handyman & Home Repair Services in Kolkata", category: "Carpentry" },
              { label: "Home Services Near Me in Kolkata", category: null }
            ]
          };`;

if (content.includes(oldChennaiBlock)) {
  content = content.replace(oldChennaiBlock, newKolkataBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Kolkata.");
} else {
  console.log("Could not find old code.");
}
