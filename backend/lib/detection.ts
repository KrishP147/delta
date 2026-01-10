/**
 * Traffic Signal Detection using Google Gemini Vision
 *
 * Uses Gemini to reliably detect traffic lights and their state.
 * Only reports a signal when it's confident a traffic light is present.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export type SignalState = "red" | "yellow" | "green" | "flashing" | "unknown";

export interface DetectionResult {
  state: SignalState;
  confidence: number;
  message: string;
}

const PROMPT = `You are a traffic light detection system for a mobile accessibility app that helps colorblind and visually impaired users navigate safely.

Analyze this image and determine if there is a traffic light visible, and if so, what color is currently illuminated (lit up/glowing).

IMPORTANT RULES:
1. ONLY report a traffic light if you can clearly see one in the image
2. Look for the ILLUMINATED/GLOWING light - traffic lights have 3 lights but only one is lit at a time
3. If there is no traffic light visible, respond with state "unknown"
4. Be conservative - only report high confidence when you're certain

Respond with ONLY a JSON object in this exact format, no other text:
{"state": "red", "confidence": 0.95}

Valid states: "red", "yellow", "green", "unknown"
Confidence should be between 0.0 and 1.0

Examples:
- Clear red light glowing: {"state": "red", "confidence": 0.95}
- Green light visible but far away: {"state": "green", "confidence": 0.7}
- No traffic light in image: {"state": "unknown", "confidence": 0}
- Something that might be a traffic light but unclear: {"state": "unknown", "confidence": 0.2}`;

/**
 * Analyzes an image using Gemini Vision to detect traffic signals
 */
export async function detectSignal(
  base64Image: string,
): Promise<DetectionResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY not set");
    return {
      state: "unknown",
      confidence: 0,
      message: "API key not configured",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Remove data URL prefix if present to get pure base64
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const content = response.text();
    console.log("Gemini response:", content);

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return {
        state: "unknown",
        confidence: 0,
        message: "No traffic signal detected",
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const state = parsed.state as SignalState;
    const confidence = parsed.confidence as number;

    // Only report if confidence is above threshold
    if (state === "unknown" || confidence < 0.5) {
      return {
        state: "unknown",
        confidence: 0,
        message: "No traffic signal detected",
      };
    }

    const messages: Record<SignalState, string> = {
      red: "Red light",
      yellow: "Yellow light - prepare to stop",
      green: "Green light",
      flashing: "Warning: flashing signal",
      unknown: "No signal detected",
    };

    console.log(`Detected: ${state} with confidence ${confidence}`);

    return {
      state,
      confidence,
      message: messages[state],
    };
  } catch (error) {
    console.error("Detection error:", error);
    return {
      state: "unknown",
      confidence: 0,
      message: "Unable to analyze image",
    };
  }
}
