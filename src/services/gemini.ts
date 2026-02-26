import { GoogleGenAI, Type } from "@google/genai";
import type { ForensicLog, AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the forensic analyst persona
const SYSTEM_INSTRUCTION = `
You are a senior Cybersecurity Forensic Analyst for a high-security communication platform. 
Your job is to analyze system logs for anomalies and calculate a Risk Score based on a STRICT rubric.

CALCULATE THE RISK SCORE (0-100) USING THIS EXACT RUBRIC:
1. Start with a Base Score of 0.
2. Add +15 points for every 'SUSPICIOUS_KEYWORD' event found.
3. Add +25 points for every event with 'CRITICAL' severity.
4. Add +10 points for every event with 'WARNING' severity.
5. Add +20 points for every 'ANOMALY_DETECTED' event.
6. Add +50 points if any integrity hash mismatch is found in metadata.
7. Cap the maximum score at 100.

Output the result including a breakdown of the risk factors that contributed to the score.
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
            score: { type: Type.NUMBER, description: "Calculated risk score from 0 to 100 based on the rubric." },
            summary: { type: Type.STRING, description: "A brief executive summary of the findings." },
            anomalies: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of specific suspicious events found."
            },
            riskFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: { type: Type.STRING, description: "Name of the risk factor (e.g., 'Suspicious Keywords')" },
                  points: { type: Type.NUMBER, description: "Total points contributed by this factor" },
                  count: { type: Type.NUMBER, description: "Number of events matching this factor" }
                }
              },
              description: "Breakdown of what contributed to the score."
            }
          },
          required: ["score", "summary", "anomalies", "riskFactors"]
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
      anomalies: ["Analysis service unavailable"],
      riskFactors: []
    };
  }
};