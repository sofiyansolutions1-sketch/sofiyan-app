const fs = require('fs');

// Patch constants.tsx
let constantsContent = fs.readFileSync('constants.tsx', 'utf8');
constantsContent = constantsContent.replace(
  "{ name: 'Ahmedabad', img: 'https://i.postimg.cc/65FqZJm8/Chat-GPT-Image-Apr-19-2026-02-40-08-AM.png', areasCount: 15 }",
  "{ name: 'Lucknow', img: 'https://images.unsplash.com/photo-1622194993926-14b533db571d?q=80&w=600&auto=format&fit=crop', areasCount: 15 }"
);
constantsContent = constantsContent.replace(
  'Ahmedabad: ["SG Highway", "Navrangpura", "Satellite", "Vastrapur", "Bopal", "Paldi", "Maninagar", "Prahlad Nagar", "Gota", "Thaltej"]',
  'Lucknow: ["Hazratganj", "Gomti Nagar", "Alambagh", "Indira Nagar", "Aminabad", "Chowk", "Kapoorthala", "Mahanagar", "Aliganj", "Ashiyana"]'
);
fs.writeFileSync('constants.tsx', constantsContent);

// Patch CustomerPanel.tsx
let customerContent = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');
customerContent = customerContent.replace(
  /ahmedabad/g,
  'lucknow'
);
customerContent = customerContent.replace(
  /Ahmedabad/g,
  'Lucknow'
);

fs.writeFileSync('pages/CustomerPanel.tsx', customerContent);

console.log("Lucknow integrated.");
