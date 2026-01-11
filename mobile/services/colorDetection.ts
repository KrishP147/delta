/**
 * Local Color Detection Service
 *
 * FAST pre-filter to detect if traffic light colors are in frame.
 * Samples raw bytes from base64 image (no full decode needed).
 *
 * Goal: <50ms to decide if we should call the API
 */

// Minimum percentage of samples with traffic light colors to trigger API
const DETECTION_THRESHOLD = 0.3; // 0.3% - very sensitive

// How many byte triplets to sample
const SAMPLE_COUNT = 200;

export interface ColorDetectionResult {
  hasTrafficLightColors: boolean;
  redDetected: boolean;
  yellowDetected: boolean;
  greenDetected: boolean;
  redPercentage: number;
  yellowPercentage: number;
  greenPercentage: number;
  processingTimeMs: number;
}

/**
 * Fast analysis of base64 image for traffic light colors
 * Uses raw byte sampling - not a proper image decode
 */
export async function detectTrafficLightColors(
  base64Image: string,
): Promise<ColorDetectionResult> {
  const startTime = Date.now();

  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // Decode base64 to bytes
    const binaryString = atob(cleanBase64);
    const len = binaryString.length;

    if (len < 1000) {
      return getEmptyResult(Date.now() - startTime);
    }

    // Sample evenly across the image data
    // Skip first ~500 bytes (headers) and sample from image data
    const startOffset = Math.min(500, Math.floor(len * 0.1));
    const step = Math.max(
      3,
      Math.floor((len - startOffset) / (SAMPLE_COUNT * 3)),
    );

    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;
    let validSamples = 0;

    for (
      let i = startOffset;
      i < len - 2 && validSamples < SAMPLE_COUNT;
      i += step
    ) {
      const r = binaryString.charCodeAt(i);
      const g = binaryString.charCodeAt(i + 1);
      const b = binaryString.charCodeAt(i + 2);

      // Skip very dark or very bright (likely not traffic lights)
      const brightness = (r + g + b) / 3;
      if (brightness < 40 || brightness > 250) continue;

      validSamples++;

      // Check for saturated colors using simple RGB thresholds
      // These are approximations but fast

      // Red: high R, low G and B
      if (r > 150 && g < 100 && b < 100 && r > g * 1.5 && r > b * 1.5) {
        redCount++;
        continue;
      }

      // Yellow/Amber: high R and G, low B
      if (r > 150 && g > 120 && b < 100 && r > b * 1.5 && g > b * 1.2) {
        yellowCount++;
        continue;
      }

      // Green: high G, lower R and B
      if (g > 100 && r < g && b < g * 1.2 && g > 80) {
        // Additional check: G should be dominant
        if (g > r * 1.2 || (g > 150 && r < 150)) {
          greenCount++;
          continue;
        }
      }
    }

    const total = Math.max(validSamples, 1);
    const redPercentage = (redCount / total) * 100;
    const yellowPercentage = (yellowCount / total) * 100;
    const greenPercentage = (greenCount / total) * 100;

    const redDetected = redPercentage >= DETECTION_THRESHOLD;
    const yellowDetected = yellowPercentage >= DETECTION_THRESHOLD;
    const greenDetected = greenPercentage >= DETECTION_THRESHOLD;

    return {
      hasTrafficLightColors: redDetected || yellowDetected || greenDetected,
      redDetected,
      yellowDetected,
      greenDetected,
      redPercentage,
      yellowPercentage,
      greenPercentage,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    // On error, return true to not block API calls
    return {
      hasTrafficLightColors: true,
      redDetected: false,
      yellowDetected: false,
      greenDetected: false,
      redPercentage: 0,
      yellowPercentage: 0,
      greenPercentage: 0,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

function getEmptyResult(processingTimeMs: number): ColorDetectionResult {
  return {
    hasTrafficLightColors: false,
    redDetected: false,
    yellowDetected: false,
    greenDetected: false,
    redPercentage: 0,
    yellowPercentage: 0,
    greenPercentage: 0,
    processingTimeMs,
  };
}
