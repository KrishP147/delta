/**
 * Backend API Service
 *
 * Handles communication with the Next.js detection backend.
 * Includes timeout handling and error recovery.
 */

import { TIMING, SignalState } from '../constants/accessibility';

// Configure this to your backend URL
// For local development: http://localhost:3000
// For production: your Vercel deployment URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface DetectionResponse {
  state: SignalState;
  confidence: number;
  message: string;
  processingTimeMs?: number;
}

/**
 * Sends an image to the backend for traffic signal detection
 */
export async function detectSignal(base64Image: string): Promise<DetectionResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMING.apiTimeout);

  try {
    const response = await fetch(`${API_BASE_URL}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - check your connection');
    }

    throw error;
  }
}

/**
 * Checks if the backend is reachable
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export { API_BASE_URL };
