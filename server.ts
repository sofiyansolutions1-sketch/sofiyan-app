import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const app = express();
export { app };

app.use(express.json());

// AI Lead Extraction API
app.post("/api/extract-lead", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key missing on server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert AI assistant that flawlessly extracts customer lead information from messy, dictated speech.
User's raw, continuous speech transcript: "${text}"

Current system time is: ${new Date().toISOString()}

Extract the following information and return ONLY a pure JSON object. If a field isn't mentioned or is unclear, leave it null.
- name: (string) Customer's full name.
- contact_number: (string) Phone number, strip non-numeric characters.
- service_type: (string) Must be one of: "AC Service", "Washing Machine", "Refrigerator", "Water Purifier", "Chimney", "Geyser", or "Other". Map it best to their request.
- service_charge: (number) Extract the total quoted price/cost. Return as a number.
- amount_paid: (number) Extract any initial/advance payment made. Return as a number.
- requirement: (string) An excellent, professional summary of the project requirements and features requested.
- follow_up_datetime: (string) Convert any mentioned follow-up time into a local datetime string (YYYY-MM-DDTHH:mm format), interpreting words like "tomorrow", "next Monday", "in 3 days" accurately based on system time. If no explicit time is given but a day is, default to 10:00.
- notes: (string) Any additional context, personality traits, or instructions.

Remember, ONLY return a raw JSON object and NOTHING else.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      let responseText = response.text?.trim() || "";
      
      // Clean up markdown if present
      if (responseText.startsWith("```json")) {
        responseText = responseText.replace(/```json|```/g, "").trim();
      } else if (responseText.startsWith("```")) {
        responseText = responseText.replace(/```/g, "").trim();
      }

      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to extract lead info." });
    }
  });

  // WhatsApp Cloud API
  app.post("/api/send-whatsapp", async (req, res) => {
    try {
      const { number, message, isTemplate, templateName, languageCode, components } = req.body;
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!accessToken || !phoneNumberId) {
        return res.status(500).json({ error: "WhatsApp API credentials missing on server." });
      }

      // WhatsApp Cloud API payload
      const data: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: number.startsWith("+") ? number.replace("+", "") : number,
      };

      if (isTemplate) {
        data.type = "template";
        data.template = {
          name: templateName,
          language: { code: languageCode || "en_US" },
          components: components || []
        };
      } else {
        data.type = "text";
        data.text = { preview_url: false, body: message };
      }

      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        data,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("WhatsApp Error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to send WhatsApp message.", 
        details: error.response?.data || error.message 
      });
    }
  });

  // Pincode Proxy to bypass CORS issues in browsers
  app.get("/api/pincode/postoffice/:area", async (req, res) => {
    try {
      const { area } = req.params;
      const response = await axios.get(`https://api.postalpincode.in/postoffice/${encodeURIComponent(area)}`, {
        timeout: 6000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
      res.json(response.data);
    } catch (error: any) {
      console.error(`Pincode API Error for area "${req.params.area}":`, error.message);
      res.status(502).json({ error: "Failed to query India Post API" });
    }
  });

  app.get("/api/pincode/code/:pincode", async (req, res) => {
    try {
      const { pincode } = req.params;
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
        timeout: 6000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
      res.json(response.data);
    } catch (error: any) {
      console.error(`Pincode API Error for PIN "${req.params.pincode}":`, error.message);
      res.status(502).json({ error: "Failed to query India Post API" });
    }
  });

async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if not running in a serverless environment like Netlify
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  startServer();
}
