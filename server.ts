import { createProxyMiddleware } from 'http-proxy-middleware';
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";

dotenv.config();

const app = express();
export { app };

app.use(express.json({ limit: '15mb' }));

const paymentVerificationCodes = new Map<string, string>();

app.post(["/api/generate-payment-code", "/generate-payment-code"], (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "bookingId is required" });
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  paymentVerificationCodes.set(bookingId, code);
  res.json({ code });
});

app.post(["/api/verify-payment", "/verify-payment"], async (req, res) => {
  try {
    const { imageBase64, bookingId, expectedAmount, expectedCode: inputCode, paymentType } = req.body;
    
    if (!imageBase64 || expectedAmount === undefined || expectedAmount === null) {
      return res.status(400).json({ 
        verified: false,
        error: "imageBase64 and expectedAmount are required" 
      });
    }

    const expectedCode = inputCode || (bookingId ? paymentVerificationCodes.get(bookingId) : undefined);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        verified: false,
        error: "Gemini API Key missing on server." 
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const parsedExpectedAmount = Number(expectedAmount);
    
    const prompt = `You are a strict, ultra-accurate financial compliance AI auditor specialized in Indian UPI, Net Banking, and digital wallet payment receipts (Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, SBI, HDFC, ICICI, Axis, etc.).

Task: Thoroughly analyze the uploaded payment screenshot image and verify if it represents a genuine, completed payment matching the target parameters.

Expected Transaction Details:
- Target Expected Amount: ₹${parsedExpectedAmount}
- Expected Verification Code/Note: ${expectedCode ? `"${expectedCode}"` : "Not strictly specified"}
- Payment Context / Purpose: ${paymentType || "Service / Onboarding Payment"}

Step-by-Step Verification Rules:
1. DOCUMENT CLASSIFICATION:
   - Check if this image is a genuine payment receipt, confirmation screen, or transaction detail screen.
   - If it is a selfie, Aadhaar, blank photo, meme, or non-payment image, immediately mark verified=false, reason="NOT_A_PAYMENT_RECEIPT", message="Uploaded image is not a valid payment screenshot."

2. PAYMENT STATUS:
   - Check if the payment status is clearly COMPLETED / SUCCESSFUL. Look for indicators like "Paid successfully", "Payment Successful", "Transaction Successful", "Transferred to", a bold green checkmark, or completed bank debit timestamp.
   - If status is "Pending", "Processing", "Failed", "Declined", "Request sent", or incomplete, mark verified=false, reason="STATUS_FAILED", message="Payment status is Pending, Failed, or incomplete. Only successful payments are accepted."

3. AMOUNT EXTRACTION & MATCHING:
   - Extract the exact numerical amount paid in INR (₹).
   - Compare with Target Expected Amount: ₹${parsedExpectedAmount}.
   - If extracted amount is significantly different (e.g. ₹10 paid instead of ₹499, or ₹50 instead of ₹125), mark verified=false, reason="AMOUNT_MISMATCH", message="Amount paid (₹" + extractedAmount + ") does not match the required amount (₹${parsedExpectedAmount})."
   - Trailing zeros and decimal places like 499.00 vs 499 or 125.0 vs 125 are considered identical.

4. TRANSACTION IDENTIFIERS (UTR / UPI Ref / Transaction ID):
   - Extract the 12-digit UTR number, UPI Reference ID, Transaction ID, or Bank Reference number (e.g., 412345678901, T2408..., etc.).

5. RECIPIENT & SENDER:
   - Extract recipient name or UPI VPA (e.g. "Sofiyan Home Services", "8115983887@ptsbi", or merchant/receiver name).
   - Extract payment app used (e.g. "PhonePe", "Google Pay", "Paytm", "BHIM", "CRED", "Bank App", "Other").

6. VERIFICATION DECISION:
   - If document is a valid payment receipt, status is strictly SUCCESSFUL, and extracted amount matches ₹${parsedExpectedAmount}, set verified=true, reason="SUCCESS".

Return ONLY a raw JSON object (strictly valid JSON, no markdown backticks, no wrapping text):
{
  "verified": boolean,
  "reason": "SUCCESS" | "AMOUNT_MISMATCH" | "STATUS_FAILED" | "NOT_A_PAYMENT_RECEIPT" | "CODE_MISMATCH" | "OCR_FAILED",
  "extractedAmount": number or null,
  "extractedUtr": string or null,
  "extractedReceiver": string or null,
  "extractedCode": string or null,
  "paymentApp": string or null,
  "confidence": number,
  "message": string,
  "summary": string
}`;

    // Strip data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          text: prompt
        },
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          }
        }
      ]
    });

    let responseText = response.text?.trim() || "";
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/```json|```/g, "").trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/```/g, "").trim();
    }

    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.warn("Failed to parse Gemini JSON response directly, text:", responseText);
      // Fallback regex extraction
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid response format from AI Vision model.");
      }
    }

    if (result.verified && bookingId) {
      // Clear the temporary code after successful verification to prevent reuse
      paymentVerificationCodes.delete(bookingId);
    }

    console.log(`[AI Payment Scanner] Outcome: ${result.verified ? 'VERIFIED ✅' : 'REJECTED ❌'} | Amount: ₹${result.extractedAmount} | UTR: ${result.extractedUtr || 'N/A'} | Reason: ${result.reason}`);

    res.json(result);
  } catch (error: any) {
    console.error("OCR Verification Error:", error);
    res.status(500).json({ 
      verified: false,
      reason: "OCR_FAILED",
      error: "Failed to verify payment screenshot.",
      message: error.message || "An unexpected error occurred during AI scanning."
    });
  }
});

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
        model: "gemini-2.5-flash",
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
        timeout: 4000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
      res.json(response.data);
    } catch {
      console.log(`Pincode API Timeout for area "${req.params.area}" (using fallback)`);
      res.json([{ Status: "Error", Message: "Timeout or API unreachable", PostOffice: null }]);
    }
  });

  app.get("/api/pincode/code/:pincode", async (req, res) => {
    try {
      const { pincode } = req.params;
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
        timeout: 4000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });
      res.json(response.data);
    } catch {
      console.log(`Pincode API Timeout for PIN "${req.params.pincode}" (using fallback)`);
      res.json([{ Status: "Error", Message: "Timeout or API unreachable", PostOffice: null }]);
    }
  });


// Google Maps Geocoding API Proxy with Nominatim Fallback
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
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
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
    const nomRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
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
});

// Google Maps Link Parser API with Redirect Resolution and Nominatim/Geocoding
app.post("/api/parse-maps-link", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL is required" });
    }

    let targetUrl = url.trim();

    // If short URL, resolve redirects
    if (targetUrl.includes('goo.gl') || targetUrl.includes('maps.app.goo.gl')) {
      try {
        const resp = await axios.get(targetUrl, {
          maxRedirects: 5,
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          validateStatus: (status) => status < 400
        });
        if (resp.request?.res?.responseUrl) {
          targetUrl = resp.request.res.responseUrl;
        }
      } catch (err: any) {
        console.warn("Failed to resolve short maps URL redirects:", err.message);
      }
    }

    let lat: number | null = null;
    let lng: number | null = null;

    // Extract coordinates from @lat,lng or q=lat,lng or center=lat,lng
    const atMatch = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      lat = parseFloat(atMatch[1]);
      lng = parseFloat(atMatch[2]);
    } else {
      const qMatch = targetUrl.match(/[?&](?:q|ll|center|saddr|daddr)=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        lat = parseFloat(qMatch[1]);
        lng = parseFloat(qMatch[2]);
      }
    }

    let nominatimData: any = null;

    if (lat !== null && lng !== null) {
      try {
        const nomRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
          headers: { "User-Agent": "SofiyanApp/1.0 (contact@sofiyan.in)" },
          timeout: 5000
        });
        nominatimData = nomRes.data;
      } catch (err: any) {
        console.warn("Nominatim reverse geocode failed:", err.message);
      }
    } else {
      let searchQuery = targetUrl;
      const placeMatch = targetUrl.match(/\/place\/([^/@]+)/);
      if (placeMatch && placeMatch[1]) {
        searchQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }

      try {
        const searchRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`, {
          headers: { "User-Agent": "SofiyanApp/1.0 (contact@sofiyan.in)" },
          timeout: 5000
        });
        if (searchRes.data && searchRes.data.length > 0) {
          nominatimData = searchRes.data[0];
          lat = parseFloat(nominatimData.lat);
          lng = parseFloat(nominatimData.lon);
        }
      } catch (err: any) {
        console.warn("Nominatim search failed:", err.message);
      }
    }

    if (nominatimData) {
      const addr = nominatimData.address || {};
      const fullAddress = nominatimData.display_name || targetUrl;
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || addr.city_district || addr.subdistrict || '';
      const pincode = addr.postcode || '';
      const city = addr.city || addr.town || addr.municipality || addr.state_district || 'Lucknow';
      const state = addr.state || '';

      return res.json({
        success: true,
        address: fullAddress,
        area,
        pincode,
        city,
        state,
        lat,
        lng
      });
    }

    return res.status(404).json({ error: "Could not extract location details from the provided link." });
  } catch (error: any) {
    console.error("Parse maps link error:", error);
    res.status(500).json({ error: "Failed to parse map link", details: error.message });
  }
});

// ==========================================
// INFLUENCER PROGRAM API ENDPOINTS
// ==========================================
const INFLUENCERS_FILE = path.join(process.cwd(), "data", "influencers.json");
const INFLUENCER_CAPTION_FILE = path.join(process.cwd(), "data", "influencer_caption.json");
const DEFAULT_CAPTION_TEMPLATE = `🛠️ Verified AC & Home Appliance Repair in Lucknow by Sofiyan Home Service!\n\nUse my code {CODE} while booking for priority technician assignment:\n🔗 {LINK}\n\n#SofiyanHomeService #LucknowService #ACRepairLucknow #HomeAppliances`;

function getInfluencerCaption(): { caption: string; updated_at?: string } {
  try {
    if (!fs.existsSync(INFLUENCER_CAPTION_FILE)) {
      fs.mkdirSync(path.dirname(INFLUENCER_CAPTION_FILE), { recursive: true });
      const initial = {
        caption: DEFAULT_CAPTION_TEMPLATE,
        updated_at: new Date().toISOString()
      };
      fs.writeFileSync(INFLUENCER_CAPTION_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(INFLUENCER_CAPTION_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!data.caption) {
      return { caption: DEFAULT_CAPTION_TEMPLATE, updated_at: new Date().toISOString() };
    }
    return data;
  } catch (err) {
    console.error("Error reading caption file:", err);
    return { caption: DEFAULT_CAPTION_TEMPLATE, updated_at: new Date().toISOString() };
  }
}

function saveInfluencerCaption(caption: string): boolean {
  try {
    fs.mkdirSync(path.dirname(INFLUENCER_CAPTION_FILE), { recursive: true });
    const payload = {
      caption: caption.trim(),
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(INFLUENCER_CAPTION_FILE, JSON.stringify(payload, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving caption file:", err);
    return false;
  }
}

function getInfluencersData(): any[] {
  try {
    if (!fs.existsSync(INFLUENCERS_FILE)) {
      fs.mkdirSync(path.dirname(INFLUENCERS_FILE), { recursive: true });
      fs.writeFileSync(INFLUENCERS_FILE, JSON.stringify([
        {
          id: "inf_1726700000001",
          page_name: "lucknow_foodie_vibes",
          contact_number: "9876543210",
          referral_code: "LUCKNOW25",
          password: "password123",
          commission_rate: 25,
          status: "Active",
          created_at: "2026-09-10T10:00:00.000Z"
        }
      ], null, 2));
    }
    const raw = fs.readFileSync(INFLUENCERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading influencers file:", err);
    return [];
  }
}

function saveInfluencersData(data: any[]): boolean {
  try {
    fs.mkdirSync(path.dirname(INFLUENCERS_FILE), { recursive: true });
    fs.writeFileSync(INFLUENCERS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving influencers file:", err);
    return false;
  }
}

async function fetchSupabaseBookings(): Promise<any[]> {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://bvtqginkszmzzmetdjdm.supabase.co";
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq";
    const res = await axios.get(`${supabaseUrl}/rest/v1/bookings?select=*&order=created_at.desc`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      },
      timeout: 6000
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err: any) {
    console.warn("Could not fetch bookings from Supabase:", err.message);
    return [];
  }
}

// 1. Get all influencers with aggregated live statistics (For Admin & Directory)
app.get("/api/influencers", async (req, res) => {
  try {
    const influencers = getInfluencersData();
    const bookings = await fetchSupabaseBookings();

    const enriched = influencers.map(inf => {
      const code = (inf.referral_code || "").trim().toUpperCase();
      const matchingBookings = bookings.filter(b => 
        b.applied_referral_code && 
        b.applied_referral_code.trim().toUpperCase() === code &&
        b.status !== 'cancelled'
      );

      const totalBookings = matchingBookings.length;
      const totalVolume = matchingBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      const commissionRate = inf.commission_rate || 25;
      const commissionAmount = Math.round(totalVolume * (commissionRate / 100));

      // Clean object without exposing raw password
      const { password, ...safeInf } = inf;
      return {
        ...safeInf,
        commission_rate: commissionRate,
        total_bookings: totalBookings,
        total_volume: totalVolume,
        commission_amount: commissionAmount,
        recent_bookings: matchingBookings.slice(0, 10).map(b => ({
          id: b.id,
          date: b.created_at || b.date,
          customer_name: b.customer_name || 'Customer',
          contact_number: b.contact_number || '',
          city: b.city || '',
          area: b.area || '',
          service: b.sub_service_name || b.service_category || 'Home Service',
          price: Number(b.price) || 0,
          commission: Math.round((Number(b.price) || 0) * (commissionRate / 100)),
          status: b.status || 'pending'
        }))
      };
    });

    res.json({ influencers: enriched });
  } catch (error: any) {
    console.error("Error fetching influencers:", error);
    res.status(500).json({ error: "Failed to fetch influencers data" });
  }
});

// 2. Get live stats for a single influencer by referral code
app.get("/api/influencers/stats/:code", async (req, res) => {
  try {
    const code = (req.params.code || "").trim().toUpperCase();
    const influencers = getInfluencersData();
    const found = influencers.find(inf => (inf.referral_code || "").trim().toUpperCase() === code);

    const bookings = await fetchSupabaseBookings();
    const matchingBookings = bookings.filter(b => 
      b.applied_referral_code && 
      b.applied_referral_code.trim().toUpperCase() === code &&
      b.status !== 'cancelled'
    );

    const totalBookings = matchingBookings.length;
    const totalVolume = matchingBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    const commissionRate = found?.commission_rate || 25;
    const commissionAmount = Math.round(totalVolume * (commissionRate / 100));

    res.json({
      id: found?.id || '',
      referral_code: code,
      page_name: found?.page_name || code,
      upi_id: found?.upi_id || '',
      commission_rate: commissionRate,
      total_bookings: totalBookings,
      total_volume: totalVolume,
      commission_amount: commissionAmount,
      bookings: matchingBookings.map(b => {
        const rawName = b.customer_name || 'Customer';
        const maskedName = rawName.length > 2 ? rawName.slice(0, 2) + '***' : rawName + '***';
        const price = Number(b.price) || 0;
        return {
          id: b.id,
          created_at: b.created_at || b.date,
          customer_name: maskedName,
          city: b.city || '',
          service: b.sub_service_name || b.service_category || 'Service Booking',
          price: price,
          commission: Math.round(price * (commissionRate / 100)),
          status: b.status || 'pending'
        };
      })
    });
  } catch (error: any) {
    console.error("Error fetching stats for referral code:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 3. Register a new influencer
app.post("/api/influencers/register", async (req, res) => {
  try {
    const { page_name, contact_number, referral_code, password, upi_id } = req.body;

    if (!page_name || !contact_number || !referral_code || !password) {
      return res.status(400).json({ error: "All fields (page name, contact number, referral code, password) are required." });
    }

    const cleanPage = page_name.trim().toLowerCase().replace(/^@/, '');
    const cleanPhone = contact_number.trim();
    const cleanCode = referral_code.trim().toUpperCase();
    const cleanUpi = (upi_id || "").trim();

    if (cleanCode.length < 3) {
      return res.status(400).json({ error: "Referral code must be at least 3 characters long." });
    }

    const influencers = getInfluencersData();

    // Check duplicate page_name
    if (influencers.some(inf => (inf.page_name || "").toLowerCase() === cleanPage)) {
      return res.status(400).json({ error: "This Instagram Page Name is already registered." });
    }

    // Check duplicate referral_code
    if (influencers.some(inf => (inf.referral_code || "").toUpperCase() === cleanCode)) {
      return res.status(400).json({ error: "This Referral Code is already taken. Please choose another unique code." });
    }

    const newInfluencer = {
      id: "inf_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      page_name: cleanPage,
      contact_number: cleanPhone,
      referral_code: cleanCode,
      upi_id: cleanUpi,
      password: password,
      commission_rate: 25,
      status: "Active",
      created_at: new Date().toISOString()
    };

    influencers.push(newInfluencer);
    saveInfluencersData(influencers);

    const { password: _, ...safeData } = newInfluencer;
    res.status(201).json({
      success: true,
      message: "Influencer registered successfully!",
      influencer: safeData
    });
  } catch (error: any) {
    console.error("Error registering influencer:", error);
    res.status(500).json({ error: "Failed to register influencer." });
  }
});

// 4. Influencer Login
app.post("/api/influencers/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Please enter your page name or code, and password." });
    }

    const cleanIdentifier = identifier.trim().toLowerCase().replace(/^@/, '');
    const influencers = getInfluencersData();

    const found = influencers.find(inf => 
      ((inf.page_name || "").toLowerCase() === cleanIdentifier ||
       (inf.referral_code || "").toLowerCase() === cleanIdentifier ||
       (inf.contact_number || "") === cleanIdentifier) &&
      inf.password === password
    );

    if (!found) {
      return res.status(401).json({ error: "Invalid credentials. Please check your Page Name / Code and Password." });
    }

    const { password: _, ...safeData } = found;
    res.json({
      success: true,
      message: "Logged in successfully",
      influencer: safeData
    });
  } catch (error: any) {
    console.error("Error logging in influencer:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 5. Update Influencer UPI ID (For Direct Payouts)
app.put("/api/influencers/upi", async (req, res) => {
  try {
    const { id, upi_id } = req.body;
    if (!id || !upi_id) {
      return res.status(400).json({ error: "Influencer ID and UPI ID are required." });
    }

    const cleanUpi = upi_id.trim();
    if (!cleanUpi.includes('@') || cleanUpi.length < 5) {
      return res.status(400).json({ error: "Please enter a valid UPI ID (e.g. name@okhdfcbank, 9876543210@paytm, name@upi)." });
    }

    const influencers = getInfluencersData();
    const index = influencers.findIndex(inf => inf.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Influencer not found." });
    }

    influencers[index].upi_id = cleanUpi;
    influencers[index].updated_at = new Date().toISOString();
    saveInfluencersData(influencers);

    const { password: _, ...safeData } = influencers[index];
    res.json({
      success: true,
      message: "UPI ID saved successfully! All 25% payouts will be routed to this UPI ID.",
      influencer: safeData
    });
  } catch (error: any) {
    console.error("Error updating UPI ID:", error);
    res.status(500).json({ error: "Failed to update UPI ID" });
  }
});

// 6. Referral code lock (Prevent repeated code changes)
app.put("/api/influencers/code", async (req, res) => {
  return res.status(403).json({
    error: "Referral code is permanently locked once assigned to maintain attribution and link stability."
  });
});

// 6. Admin toggle influencer status (Active / Paused)
app.patch("/api/influencers/status", async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required." });
    }

    const influencers = getInfluencersData();
    const index = influencers.findIndex(inf => inf.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Influencer not found." });
    }

    influencers[index].status = status;
    saveInfluencersData(influencers);

    res.json({ success: true, status });
  } catch (error: any) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// 7. Get Promo / Bio Caption Template for Influencers
app.get("/api/influencers/caption", (req, res) => {
  try {
    const captionData = getInfluencerCaption();
    res.json(captionData);
  } catch (err: any) {
    console.error("Error fetching influencer caption:", err);
    res.status(500).json({ error: "Failed to retrieve caption" });
  }
});

// 8. Admin update Promo / Bio Caption Template
app.put("/api/influencers/caption", (req, res) => {
  try {
    const { caption } = req.body;
    if (typeof caption !== 'string' || !caption.trim()) {
      return res.status(400).json({ error: "Caption text cannot be empty." });
    }

    const ok = saveInfluencerCaption(caption);
    if (!ok) {
      return res.status(500).json({ error: "Failed to save caption template." });
    }

    const updated = getInfluencerCaption();
    res.json({
      success: true,
      message: "Influencer promo caption updated and broadcasted successfully!",
      ...updated
    });
  } catch (error: any) {
    console.error("Error saving influencer caption:", error);
    res.status(500).json({ error: "Failed to update caption" });
  }
});

async function startServer() {
  const PORT = 3000;

  
  // Proxy for Supabase (Bypass AdBlockers / CORS)
  app.use('/supabase-api', createProxyMiddleware({
    target: 'https://bvtqginkszmzzmetdjdm.supabase.co',
    changeOrigin: true,
    pathRewrite: { '^/supabase-api': '' },
    onProxyReq: () => {},
    onError: (err, _req, res) => {
       console.error("Proxy error:", err);
       res.status(500).send("Proxy error");
    }
  }));

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
