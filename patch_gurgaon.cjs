const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad'].includes(activeCity.toLowerCase()) && (() => {`;
const newCodeStart = `{['bangalore', 'delhi', 'mumbai', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'gurgaon'].includes(activeCity.toLowerCase()) && (() => {`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCodeStart);
}

const oldAhmedabadBlock = `              { label: "Home Services Near Me in Ahmedabad", category: null }
            ]
          };`;

const newGurgaonBlock = `              { label: "Home Services Near Me in Ahmedabad", category: null }
            ],
            gurgaon: [
              { label: "Home Cleaning Services in Gurgaon", category: "Cleaning" },
              { label: "Deep Home Cleaning Services in Gurgaon", category: "Cleaning" },
              { label: "Bathroom & Kitchen Cleaning in Gurgaon", category: "Cleaning" },
              { label: "Sofa & Carpet Cleaning in Gurgaon", category: "Cleaning" },
              { label: "Electrician Services in Gurgaon", category: "Electrician" },
              { label: "24x7 Emergency Electrician in Gurgaon", category: "Electrician" },
              { label: "Plumber Services in Gurgaon", category: "Plumbing" },
              { label: "Emergency Plumbing & Repair in Gurgaon", category: "Plumbing" },
              { label: "AC Service & Repair in Gurgaon", category: "AC Repair" },
              { label: "AC Installation & Gas Refilling in Gurgaon", category: "AC Repair" },
              { label: "Appliance Repair Services in Gurgaon", category: "Appliances" },
              { label: "Washing Machine Repair in Gurgaon", category: "Appliances" },
              { label: "Refrigerator Repair & Service in Gurgaon", category: "Appliances" },
              { label: "Geyser Repair & Service in Gurgaon", category: "Appliances" },
              { label: "RO & Water Purifier Repair in Gurgaon", category: "Appliances" },
              { label: "TV & Electronics Repair in Gurgaon", category: "Appliances" },
              { label: "Pest Control Services in Gurgaon", category: "Pest Control" },
              { label: "Cockroach, Termite & Bed Bug Control in Gurgaon", category: "Pest Control" },
              { label: "Carpenter Services in Gurgaon", category: "Carpentry" },
              { label: "Home Painting Services in Gurgaon", category: "Painting" },
              { label: "Waterproofing Services in Gurgaon", category: "Painting" },
              { label: "Handyman & Home Repair Services in Gurgaon", category: "Carpentry" },
              { label: "Home Services Near Me in Gurgaon", category: null }
            ]
          };`;

if (content.includes(oldAhmedabadBlock)) {
  content = content.replace(oldAhmedabadBlock, newGurgaonBlock);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Quick Links successfully patched for Gurgaon.");
} else {
  console.log("Could not find old code.");
}
