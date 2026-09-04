const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldKolkataBlock = `              { label: "Home Services Near Me in Kolkata", category: null }
            ]
          };`;

const newAhmedabadBlock = `              { label: "Home Services Near Me in Kolkata", category: null }
            ],
            ahmedabad: [
              { label: "Home Cleaning Services in Ahmedabad", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Ahmedabad", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Ahmedabad", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Ahmedabad", category: "Cleaning" },
              { label: "Electrician Services in Ahmedabad", category: "Electrician" },
              { label: "Emergency Electrician Services in Ahmedabad", category: "Electrician" },
              { label: "Plumber Services in Ahmedabad", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Ahmedabad", category: "Plumbing" },
              { label: "AC Service & Repair in Ahmedabad", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Ahmedabad", category: "AC Repair" },
              { label: "Appliance Repair Services in Ahmedabad", category: "Appliances" },
              { label: "Washing Machine Repair in Ahmedabad", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Ahmedabad", category: "Appliances" },
              { label: "Geyser Repair & Service in Ahmedabad", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Ahmedabad", category: "Appliances" },
              { label: "TV & Electronics Repair in Ahmedabad", category: "Appliances" },
              { label: "Pest Control Services in Ahmedabad", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Ahmedabad", category: "Pest Control" },
              { label: "Carpenter Services in Ahmedabad", category: "Carpentry" },
              { label: "Home Painting Services in Ahmedabad", category: "Painting" },
              { label: "Waterproofing Services in Ahmedabad", category: "Painting" },
              { label: "Handyman & Home Repair Services in Ahmedabad", category: "Carpentry" },
              { label: "Home Services Near Me in Ahmedabad", category: null }
            ]
          };`;

if (content.includes(oldKolkataBlock)) {
  content = content.replace(oldKolkataBlock, newAhmedabadBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Ahmedabad.");
} else {
  console.log("Could not find old code.");
}
