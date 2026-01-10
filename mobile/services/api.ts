/**
 * Backend API Service
 *
 * Handles communication with the Next.js detection backend.
 * Falls back to direct Roboflow API if backend is unreachable.
 */

import { TIMING, SignalState } from '../constants/accessibility';

// Configure this to your backend URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// Roboflow direct API (fallback when backend unreachable)
const ROBOFLOW_API_KEY = 'SUVn3OiqF6PqIASCVWJT';
const ROBOFLOW_MODEL = 'traffic-light-cnlh5/1';
const ROBOFLOW_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}?api_key=${ROBOFLOW_API_KEY}`;

// Track if we should use direct Roboflow
let useDirectRoboflow = false;

// Log the API URL on load for debugging
console.log('[API] Backend URL:', API_BASE_URL);

export interface DetectionResponse {
  state: SignalState;
  confidence: number;
  message: string;
  processingTimeMs?: number;
}

/**
 * Sends an image to the backend for traffic signal detection
 * Falls back to direct Roboflow API if backend is unreachable
 */
export async function detectSignal(base64Image: string): Promise<DetectionResponse> {
  // If we've determined backend is unreachable, go direct to Roboflow
  if (useDirectRoboflow) {
    return detectSignalDirect(base64Image);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMING.apiTimeout);

  try {
    console.log('[API] Sending detection request to:', `${API_BASE_URL}/api/detect`);

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
      console.error('[API] Detection error:', response.status, response.statusText);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[API] Detection result:', result.state, 'confidence:', result.confidence);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[API] Request timeout - switching to direct Roboflow');
        useDirectRoboflow = true;
        return detectSignalDirect(base64Image);
      }
      console.error('[API] Error:', error.message, '- switching to direct Roboflow');
      useDirectRoboflow = true;
      return detectSignalDirect(base64Image);
    }

    throw error;
  }
}

/**
 * Direct Roboflow API call (bypasses backend)
 */
async function detectSignalDirect(base64Image: string): Promise<DetectionResponse> {
  try {
    console.log('[API] Using direct Roboflow API');
    
    const response = await fetch(ROBOFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Image,
    });

    if (!response.ok) {
      throw new Error(`Roboflow error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Roboflow response
    if (!data.predictions || data.predictions.length === 0) {
      return {
        state: 'unknown' as SignalState,
        confidence: 0,
        message: 'No traffic light detected',
      };
    }

    // Find the highest confidence prediction
    const best = data.predictions.reduce((a: any, b: any) => 
      (a.confidence > b.confidence) ? a : b
    );

    // Map Roboflow class to our signal state
    const classToState: Record<string, SignalState> = {
      'red': 'red',
      'yellow': 'yellow',
      'green': 'green',
      'Red': 'red',
      'Yellow': 'yellow',
      'Green': 'green',
    };

    const state = classToState[best.class] || 'unknown';
    const position = state === 'red' ? 'Top' : state === 'yellow' ? 'Middle' : state === 'green' ? 'Bottom' : '';
    const action = state === 'red' ? 'Stop' : state === 'yellow' ? 'Caution' : state === 'green' ? 'Go' : '';

    return {
      state,
      confidence: best.confidence,
      message: state !== 'unknown' 
        ? `${state.charAt(0).toUpperCase() + state.slice(1)} light. ${action}. ${position} light is on.`
        : 'Scanning for traffic lights...',
    };
  } catch (error) {
    console.error('[API] Direct Roboflow error:', error);
    return {
      state: 'unknown' as SignalState,
      confidence: 0,
      message: 'Detection error',
    };
  }
}

/**
 * Checks if the backend is reachable
 * If not, enables direct Roboflow mode
 */
export async function checkHealth(): Promise<boolean> {
  try {
    console.log('[API] Checking health at:', `${API_BASE_URL}/api/health`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('[API] Health check passed - using backend');
      useDirectRoboflow = false;
      return true;
    } else {
      console.log('[API] Health check failed - using direct Roboflow');
      useDirectRoboflow = true;
      return true; // Return true because direct Roboflow will work
    }
  } catch (error) {
    console.log('[API] Backend unreachable - using direct Roboflow');
    useDirectRoboflow = true;
    return true; // Return true because direct Roboflow will work
  }
}
