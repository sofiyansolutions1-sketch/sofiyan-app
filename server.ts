import { createProxyMiddleware } from 'http-proxy-middleware';
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";
import https from "https";

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
