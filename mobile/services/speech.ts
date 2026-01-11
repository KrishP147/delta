/**
 * Text-to-Speech Service
 *
 * Provides audio feedback for traffic signal detection.
 * Supports both Expo Speech (offline) and ElevenLabs (natural voice).
 *
 * ACCESSIBILITY DECISION:
 * - Expo Speech is the default (reliable, works offline)
 * - ElevenLabs can be enabled for more natural voice (requires internet)
 *
 * AUDIO POLICY:
 * - By default, only urgent color alerts trigger audio (alertsOnlyAudio = true)
 * - Navigation/UI feedback is silent unless alertsOnlyAudio is disabled
 * - Use speakAlert() for urgent color alerts (always plays)
 * - Use speak() for general feedback (respects alertsOnlyAudio setting)
 */

import * as Speech from "expo-speech";
import {
  SignalState,
  ColorblindnessType,
  getSignalMessage,
  TIMING,
} from "../constants/accessibility";

// State for debouncing
let lastSpokenState: SignalState | null = null;
let lastSpokenTime = 0;

// Audio mode: if true, only urgent alerts will trigger audio
let alertsOnlyMode = true;

/**
 * Set the alerts-only audio mode
 * When true, only speakAlert() will produce audio
 * When false, speak() will also produce audio
 */
export function setAlertsOnlyMode(enabled: boolean): void {
  alertsOnlyMode = enabled;
}

/**
 * Check if alerts-only mode is enabled
 */
export function isAlertsOnlyMode(): boolean {
  return alertsOnlyMode;
}

// ElevenLabs configuration
interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
}

let elevenLabsConfig: ElevenLabsConfig | null = null;

/**
 * Configure ElevenLabs for natural voice
 */
export function configureElevenLabs(apiKey: string, voiceId: string): void {
  elevenLabsConfig = { apiKey, voiceId };
}

/**
 * Disable ElevenLabs and use Expo Speech
 */
export function disableElevenLabs(): void {
  elevenLabsConfig = null;
}

/**
 * Speaks the traffic signal state if it has changed
 * Includes debouncing to avoid repetitive announcements
 */
export async function speakSignalState(
  state: SignalState,
  colorblindType: ColorblindnessType,
  usePositionCues: boolean = true,
  force = false
): Promise<void> {
  const now = Date.now();

  // Skip if same state was announced recently (debouncing)
  if (
    !force &&
    state === lastSpokenState &&
    now - lastSpokenTime < TIMING.audioDebounce
  ) {
    return;
  }

  // Don't announce unknown state
  if (state === "unknown") {
    return;
  }

  // Get message with optional position cues
  const effectiveType = usePositionCues ? colorblindType : "normal";
  const message = getSignalMessage(state, effectiveType);
  if (!message) return;

  // Stop any current speech
  await Speech.stop();

  // Speak using configured provider
  if (elevenLabsConfig) {
    await speakWithElevenLabs(message, state);
  } else {
    speakWithExpo(message, state);
  }

  lastSpokenState = state;
  lastSpokenTime = now;
}

/**
 * Speak using Expo Speech (offline, reliable)
 */
function speakWithExpo(message: string, state?: SignalState): void {
  let pitch = 1.0;
  let rate = 1.1;

  // Adjust voice characteristics based on state
  if (state === "red") {
    pitch = 0.9; // Lower for urgency
    rate = 1.0; // Slower for clarity
  } else if (state === "yellow") {
    rate = 1.2; // Faster for warning
  }

  Speech.speak(message, {
    language: "en-US",
    pitch,
    rate,
  });
}

/**
 * Speak using ElevenLabs (natural voice, requires internet)
 * Exported for direct use in components that need ElevenLabs-specific alerts
 */
export async function speakWithElevenLabs(
  message: string,
  state?: SignalState
): Promise<void> {
  if (!elevenLabsConfig) {
    // Fallback to Expo Speech
    speakWithExpo(message, state);
    return;
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsConfig.voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsConfig.apiKey,
        },
        body: JSON.stringify({
          text: message,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            // Adjust for urgency based on state
            ...(state === "red" && { stability: 0.7, similarity_boost: 0.8 }),
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // For now, fall back to Expo Speech since we can't easily play audio buffers
    // In a production app, you'd use expo-av to play the audio
    console.log("ElevenLabs response received, using Expo Speech for playback");
    speakWithExpo(message, state);
  } catch (error) {
    console.error("ElevenLabs error, falling back to Expo Speech:", error);
    speakWithExpo(message, state);
  }
}

/**
 * Speaks a custom message (respects alertsOnlyMode)
 * Use this for general navigation/UI feedback
 * Will be silent if alertsOnlyMode is enabled
 */
export async function speak(
  message: string,
  options?: { rate?: number; pitch?: number }
): Promise<void> {
  // Skip if alerts-only mode is enabled (no navigation audio)
  if (alertsOnlyMode) {
    console.log('[Speech] Skipped (alerts-only mode):', message);
    return;
  }

  await Speech.stop();
  Speech.speak(message, {
    language: "en-US",
    pitch: options?.pitch ?? 1.0,
    rate: options?.rate ?? 1.0,
  });
}

/**
 * Speaks an urgent alert (always plays, ignores alertsOnlyMode)
 * Use this for color-related safety alerts only
 */
export async function speakAlert(
  message: string,
  options?: { rate?: number; pitch?: number }
): Promise<void> {
  await Speech.stop();
  Speech.speak(message, {
    language: "en-US",
    pitch: options?.pitch ?? 1.0,
    rate: options?.rate ?? 1.0,
  });
}

/**
 * Speaks a hazard alert with appropriate urgency
 */
export async function speakHazardAlert(
  hazardType: string,
  location: string,
  action: string,
  urgency: "critical" | "warning" | "info" = "warning"
): Promise<void> {
  const message = `${hazardType} ${location}. ${action}`;

  await Speech.stop();

  let pitch = 1.0;
  let rate = 1.1;

  switch (urgency) {
    case "critical":
      pitch = 1.1;
      rate = 1.3; // Fast and urgent
      break;
    case "warning":
      rate = 1.1;
      break;
    case "info":
      rate = 1.0;
      break;
  }

  Speech.speak(message, {
    language: "en-US",
    pitch,
    rate,
  });
}

/**
 * Speaks proximity/urgency alerts for low vision users
 * Prioritizes by closeness and movement potential
 */
export async function speakProximityAlert(
  objectLabel: string,
  distance: "very close" | "close" | "moderate" | "far",
  direction?: "ahead" | "left" | "right" | "center"
): Promise<void> {
  let message = "";
  let pitch = 1.0;
  let rate = 1.0;

  switch (distance) {
    case "very close":
      message = `Warning! ${objectLabel} very close`;
      if (direction) message += ` ${direction}`;
      pitch = 1.2;
      rate = 1.4; // Very fast and urgent
      break;
    case "close":
      message = `${objectLabel} approaching`;
      if (direction) message += ` on ${direction}`;
      pitch = 1.1;
      rate = 1.2;
      break;
    case "moderate":
      message = `${objectLabel} ${direction || "ahead"}`;
      rate = 1.1;
      break;
    case "far":
      message = `${objectLabel} in distance`;
      if (direction) message += ` ${direction}`;
      rate = 1.0;
      break;
  }

  await Speech.stop();
  Speech.speak(message, {
    language: "en-US",
    pitch,
    rate,
  });
}

/**
 * Provides detailed scene description for low vision users
 * More verbose than standard alerts
 */
export async function speakSceneDescription(
  objects: Array<{ label: string; size: string; location: string }>
): Promise<void> {
  if (objects.length === 0) {
    await speak("No objects detected");
    return;
  }

  let message = `${objects.length} object${objects.length > 1 ? 's' : ''} detected. `;
  
  // Describe top 3 most important objects
  const topObjects = objects.slice(0, 3);
  topObjects.forEach((obj, index) => {
    if (index > 0) message += ". ";
    message += `${obj.size} ${obj.label} ${obj.location}`;
  });

  await Speech.stop();
  Speech.speak(message, {
    language: "en-US",
    pitch: 1.0,
    rate: 1.0,
  });
}

/**
 * Stops any current speech
 */
export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
}

/**
 * Checks if TTS is currently speaking
 */
export async function isSpeaking(): Promise<boolean> {
  return await Speech.isSpeakingAsync();
}

/**
 * Resets the debounce state (useful when resuming the app)
 */
export function resetSpeechState(): void {
  lastSpokenState = null;
  lastSpokenTime = 0;
}

/**
 * Get available voices for testing
 */
export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  return await Speech.getAvailableVoicesAsync();
}
