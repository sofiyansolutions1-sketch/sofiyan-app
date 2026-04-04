import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini features will not work.");
      throw new Error("GEMINI_API_KEY is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const getCoordinatesWithGemini = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What are the coordinates (latitude and longitude) of this address: ${address}? Please respond ONLY with a JSON object in this format: {"lat": 12.34, "lng": 56.78}. Do not include any other text.`,
      config: {
        tools: [{googleMaps: {}}],
      },
    });
    
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.lat && data.lng) {
        return { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting coordinates with Gemini:", error);
    return null;
  }
};

export const getAddressSuggestions = async (query: string): Promise<Array<{name: string, display_name: string}>> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide up to 5 address suggestions in India for the search query: "${query}". Please respond ONLY with a JSON array of objects in this format: [{"name": "Short Name", "display_name": "Full Address, City, State, India"}]. Do not include any other text or markdown formatting.`,
      config: {
        tools: [{googleMaps: {}}],
      },
    });
    
    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error getting address suggestions with Gemini:", error);
    return [];
  }
};

export const reverseGeocodeWithGemini = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the address for the coordinates latitude ${lat} and longitude ${lng}? Please respond ONLY with a JSON object in this format: {"address": "Full Address, City, State, Country"}. Do not include any other text.`,
      config: {
        tools: [{googleMaps: {}}],
      },
    });
    
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.address) {
        return data.address;
      }
    }
    return null;
  } catch (error) {
    console.error("Error reverse geocoding with Gemini:", error);
    return null;
  }
};
