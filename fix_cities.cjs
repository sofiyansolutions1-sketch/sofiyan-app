const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

code = code.replace(
    /\{\['Delhi', 'Gurgaon', 'Noida', 'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'\]\.map\(city => \(/,
    `{['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'].map(city => (`
);

fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Cities fixed!");
