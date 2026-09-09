const fs = require('fs');
const path = 'server.ts';
let content = fs.readFileSync(path, 'utf8');

const newRoute = `
// Google Maps Geocoding API Proxy
app.get("/api/geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Google Maps API Key (GOOGLE_MAPS_API_KEY) is missing on the server. Please add it to your environment." });
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat or lng" });
    }

    const response = await axios.get(\`https://maps.googleapis.com/maps/api/geocode/json?latlng=\${lat},\${lng}&key=\${apiKey}\`);
    res.json(response.data);
  } catch (error: any) {
    console.error("Geocoding API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch geocoding data" });
  }
});
`;

// Insert the new route before "async function startServer()"
content = content.replace("async function startServer()", newRoute + "\nasync function startServer()");
fs.writeFileSync(path, content);
console.log("Patched server.ts with /api/geocode");
