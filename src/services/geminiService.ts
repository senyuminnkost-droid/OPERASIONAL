
import { GoogleGenAI } from "@google/genai";
import { Complaint } from "../types";

export const getGeminiInsights = async (complaints: Complaint[]) => {
  // Fixed: Ensure the API key is obtained exclusively from process.env.API_KEY
  if (!process.env.API_KEY || process.env.API_KEY === '') {
    console.warn("API_KEY tidak ditemukan di environment variables.");
    return "Analisis AI tidak tersedia (API Key belum dikonfigurasi).";
  }

  try {
    // Fixed: Initializing the GenAI client using the correct named parameter syntax
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan ringkasan singkat dalam 2 kalimat mengenai tren keluhan kost ini: ${JSON.stringify(complaints)}`,
    });
    
    // Fixed: Access the .text property directly (property access, not a method call)
    return response.text || "Tidak ada analisis tersedia.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Gagal mendapatkan analisis AI saat ini.";
  }
};
