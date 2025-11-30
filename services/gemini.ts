import { GoogleGenAI, Type } from "@google/genai";
import { ForensicLog, AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the forensic analyst persona
const SYSTEM_INSTRUCTION = `
You are a senior Cybersecurity Forensic Analyst for a high-security communication platform. 
Your job is to analyze system logs for anomalies, potential insider threats, and security breaches.
Focus on:
1. Unusual login times or locations (simulated).
2. High frequency of decryption events.
3. Use of suspicious keywords in metadata (e.g., "leak", "secret", "hack", "bypass").
4. Mismatched integrity hashes.

Provide a concise, professional summary and a risk score (0-100).
`;

export const analyzeLogs = async (logs: ForensicLog[]): Promise<AnalysisResult> => {
  try {
    // We only send metadata to Gemini, never the decrypted content (simulating privacy preservation).
    const logSummary = logs.map(l => ({
      time: new Date(l.timestamp).toISOString(),
      type: l.eventType,
      severity: l.severity,
      metadata: l.metadata,
      hash: l.hash.substring(0, 8) + '...'
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify(logSummary),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Risk score from 0 to 100, where 100 is critical." },
            summary: { type: Type.STRING, description: "A brief executive summary of the findings." },
            anomalies: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of specific suspicious events found."
            }
          },
          required: ["score", "summary", "anomalies"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      score: 0,
      summary: "Automated analysis failed. Manual review required.",
      anomalies: ["Analysis service unavailable"]
    };
  }
};