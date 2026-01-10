import { NextRequest, NextResponse } from "next/server";
import { detectSignal, DetectionResult } from "@/lib/detection";

/**
 * POST /api/detect
 *
 * Accepts a base64-encoded image and returns traffic signal detection results.
 *
 * Request body:
 * {
 *   "image": "base64-encoded-image-data",
 *   "debug": boolean (optional) - include debug info in response
 * }
 *
 * Response:
 * {
 *   "state": "red" | "yellow" | "green" | "flashing" | "unknown",
 *   "confidence": 0-1,
 *   "message": "Human-readable message for TTS",
 *   "debug": { ... } (if requested)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: "Missing required field: image" },
        { status: 400 },
      );
    }

    const startTime = Date.now();
    const result = await detectSignal(body.image);
    const processingTime = Date.now() - startTime;

    const response = {
      state: result.state,
      confidence: result.confidence,
      message: result.message,
      processingTimeMs: processingTime,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Detection endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }
}

// Health check via GET (convenience)
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/detect",
    method: "POST",
    description: "Send a base64-encoded image to detect traffic signal state",
  });
}
