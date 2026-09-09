const fs = require('fs');
const path = 'server.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `// Google Maps Geocoding API Proxy
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
});`;

const replaceStr = `// Google Maps Geocoding API Proxy with Nominatim Fallback
app.get("/api/geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Missing lat or lng" });
    }

    // Attempt Google Maps API first if key exists
    if (apiKey) {
        try {
            const response = await axios.get(\`https://maps.googleapis.com/maps/api/geocode/json?latlng=\${lat},\${lng}&key=\${apiKey}\`);
            if (response.data.status === "OK") {
                return res.json(response.data);
            } else if (response.data.status === "REQUEST_DENIED") {
                console.warn("Google Maps API REQUEST_DENIED. Falling back to Nominatim.");
            }
        } catch (gErr: any) {
            console.warn("Google Maps API error, falling back to Nominatim", gErr.message);
        }
    } else {
        console.warn("No Google Maps API Key found, using Nominatim fallback.");
    }

    // Fallback to OpenStreetMap Nominatim
    const nomRes = await axios.get(\`https://nominatim.openstreetmap.org/reverse?lat=\${lat}&lon=\${lng}&format=json\`, {
        headers: {
            "User-Agent": "SofiyanApp/1.0 (contact@sofiyan.in)"
        }
    });

    if (nomRes.data) {
        // Map Nominatim response to Google Maps structure so the frontend code works without changes
        const address = nomRes.data.address;
        
        const mappedComponents = [];
        if (address.postcode) {
            mappedComponents.push({ types: ["postal_code"], long_name: address.postcode });
        }
        if (address.city || address.town) {
            mappedComponents.push({ types: ["locality"], long_name: address.city || address.town });
        }
        if (address.state_district) {
            mappedComponents.push({ types: ["administrative_area_level_2"], long_name: address.state_district });
        }
        if (address.suburb || address.neighbourhood || address.residential) {
            mappedComponents.push({ types: ["sublocality"], long_name: address.suburb || address.neighbourhood || address.residential });
        }

        return res.json({
            results: [{
                formatted_address: nomRes.data.display_name,
                address_components: mappedComponents
            }],
            status: "OK"
        });
    }

    res.status(500).json({ error: "Failed to fetch geocoding data from all sources" });

  } catch (error: any) {
    console.error("Geocoding API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch geocoding data" });
  }
});`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(path, content);
    console.log("Patched server.ts with Nominatim fallback");
} else {
    console.log("Could not find the target string in server.ts");
}
