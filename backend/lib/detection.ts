/**
 * Traffic Signal Detection using Roboflow
 *
 * Uses a pre-trained YOLO model hosted on Roboflow to detect traffic lights
 * and their colors (red, yellow, green).
 *
 * Free tier: 10,000 calls/month
 * Model: Traffic light detection with color classification
 */

export type SignalState = "red" | "yellow" | "green" | "flashing" | "unknown";

export interface DetectionResult {
  state: SignalState;
  confidence: number;
  message: string;
}

interface RoboflowPrediction {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
}

/**
 * Detect traffic lights using Roboflow's hosted model
 */
export async function detectSignal(
  base64Image: string,
): Promise<DetectionResult> {
  const apiKey = process.env.ROBOFLOW_API_KEY;

  if (!apiKey) {
    console.error("ROBOFLOW_API_KEY not set");
    return {
      state: "unknown",
      confidence: 0,
      message: "API key not configured",
    };
  }

  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // Call Roboflow inference API
    // Using the traffic light model that detects red, yellow, green
    const response = await fetch(
      `https://detect.roboflow.com/traffic-light-cnlh5/1?api_key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: base64Data,
      },
    );

    if (!response.ok) {
      throw new Error(`Roboflow API error: ${response.status}`);
    }

    const data: RoboflowResponse = await response.json();

    console.log("Roboflow predictions:", JSON.stringify(data.predictions));

    if (!data.predictions || data.predictions.length === 0) {
      return {
        state: "unknown",
        confidence: 0,
        message: "No traffic signal detected",
      };
    }

    // Find the highest confidence traffic light prediction
    // Filter for traffic light colors
    const trafficLightPredictions = data.predictions.filter((p) =>
      ["red", "yellow", "green", "go", "stop", "warning"].includes(
        p.class.toLowerCase(),
      ),
    );

    if (trafficLightPredictions.length === 0) {
      return {
        state: "unknown",
        confidence: 0,
        message: "No traffic signal detected",
      };
    }

    // Get the prediction with highest confidence
    const best = trafficLightPredictions.reduce((a, b) =>
      a.confidence > b.confidence ? a : b,
    );

    // Map class names to our states
    const classLower = best.class.toLowerCase();
    let state: SignalState = "unknown";

    if (classLower === "red" || classLower === "stop") {
      state = "red";
    } else if (
      classLower === "yellow" ||
      classLower === "warning" ||
      classLower === "amber"
    ) {
      state = "yellow";
    } else if (classLower === "green" || classLower === "go") {
      state = "green";
    }

    if (state === "unknown" || best.confidence < 0.4) {
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

    console.log(
      `Detected: ${state} (confidence: ${best.confidence.toFixed(2)})`,
    );

    return {
      state,
      confidence: best.confidence,
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
