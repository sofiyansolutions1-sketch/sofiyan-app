const http = require('http');

const predefinedAreas = {
  Bangalore: ["Bellandur", "Koramangala", "Brookefield", "Indiranagar", "BTM Layout", "Hebbal", "HSR Layout", "Hongasandra", "Whitefield", "Hoodi", "Marathahalli", "Hulimavu", "Electronic City", "Kudlu", "Mahadevapura", "Mahalakshmi", "Munnekolala", "Nagasandra", "Rayasandra", "Sarjapura", "Seegehalli", "Singasandra", "Tejaswini Nagar", "Thanisandra", "Varthur", "Yelahanka", "Yeswanthpur"],
  Delhi: ["Connaught Place", "Karol Bagh", "Dwarka", "Vasant Kunj", "Rohini", "Saket", "Hauz Khas", "Lajpat Nagar", "Janakpuri", "Pitampura", "Chandni Chowk", "Okhla"],
  Mumbai: ["Andheri", "Bandra", "Borivali", "Juhu", "Colaba", "Malad", "Navi Mumbai", "Goregaon", "Powai", "Dadar", "Thane", "Kalyan"],
  Hyderabad: ["HITEC City", "Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kukatpally", "Secunderabad", "Ameerpet", "Miyapur", "Kondapur"],
  Chennai: ["T Nagar", "Anna Nagar", "Adyar", "Velachery", "Tambaram", "Guindy", "OMR", "Porur", "Mylapore", "Thiruvanmiyur"],
  Pune: ["Hinjewadi", "Kothrud", "Koregaon Park", "Viman Nagar", "Wakad", "Baner", "Hadapsar", "Kharadi", "Shivajinagar", "Pimpri Chinchwad"],
  Kolkata: ["Salt Lake", "New Town", "Park Street", "Ballygunge", "Dum Dum", "Jadavpur", "Garia", "Rajarhat", "Tollygunge", "Howrah"],
  Ahmedabad: ["SG Highway", "Navrangpura", "Satellite", "Vastrapur", "Bopal", "Paldi", "Maninagar", "Prahlad Nagar", "Gota", "Thaltej"],
  Gurgaon: ["Cyber City", "Sohna Road", "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "Golf Course Road", "Sector 56", "Sector 14", "Palam Vihar"],
  Noida: ["Sector 18", "Sector 62", "Sector 15", "Sector 63", "Greater Noida", "Sector 137", "Sector 50", "Sector 16"],
  Varanasi: ["Ghats", "Lanka", "Godowlia", "Sigra", "Sarnath", "Cantonment", "Bhelupur", "Pandeypur", "Mahmoorganj", "Jaitpura", "Chaitganj", "Adampura"],
  Gorakhpur: ["Gorakhnath", "Golghar", "Medical College Road", "Asuran", "Shahpur", "Rapti Nagar", "Mohaddipur", "Buxipur", "Taramandal", "Pipraich", "Sardar Nagar", "Gida"]
};

const allAreas = Object.values(predefinedAreas).flat();

async function fetchPincode(area) {
  return new Promise((resolve) => {
    let search = encodeURIComponent(area);
    const req = http.get(`http://localhost:3000/api/pincode/postoffice/${search}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0] && parsed[0].Status === 'Success') {
             const pins = parsed[0].PostOffice.map(po => po.Pincode).filter(Boolean);
             return resolve([...new Set(pins)]);
          }
        } catch (e) {}
        resolve([]);
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(3000, () => { req.destroy(); resolve([]); });
  });
}

async function run() {
  const results = {};
  
  const promises = allAreas.map(async (area) => {
    let pins = await fetchPincode(area);
    if (pins.length === 0) {
        const simplified = area.replace(/\b(Layout|Phase|Extension|City|Block|Stage|Sector|Road)\b/gi, '').trim();
        if (simplified && simplified.length > 2 && simplified !== area) {
            pins = await fetchPincode(simplified);
        }
    }
    if (pins.length === 0) {
        const first = area.split(' ')[0];
        if (first.length > 3 && first !== area && !first.toLowerCase().includes('layout')) {
            pins = await fetchPincode(first);
        }
    }
    if (pins.length > 0) {
        results[area.toLowerCase()] = pins;
    }
  });

  await Promise.all(promises);
  
  const fs = require('fs');
  fs.writeFileSync('fast_pins.json', JSON.stringify(results, null, 2));
  console.log("Done");
}

run();
