/**
 * Text-to-Speech Service
 *
 * Provides audio feedback for traffic signal detection.
 * Uses ElevenLabs for natural voice, with Expo Speech as offline fallback.
 */

import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import {
  SignalState,
  ColorblindnessType,
  getSignalMessage,
} from "../constants/accessibility";

// ============================================================
// TTS TOGGLE - Change this to switch between providers
// ============================================================
// Set to true for ElevenLabs (natural voice, uses API credits)
// Set to false for Expo Speech (device TTS, free/offline)
const USE_ELEVENLABS = false;
// ============================================================

// Bypass TS errors for expo-file-system
const FS = FileSystem as any;

let lastSpokenState: SignalState | null = null;
let soundObject: Audio.Sound | null = null;

// Cache for downloaded audio files
const audioCache: Record<string, string> = {};

// API URL (replace with computer IP for development)
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Cleanup previous sound object
 */
async function unloadSound() {
  if (soundObject) {
    try {
      await soundObject.unloadAsync();
    } catch (e) {
      console.warn("Error unloading sound:", e);
    }
    soundObject = null;
  }
}

/**
 * Speak using ElevenLabs (via backend proxy)
 */
async function speakElevenLabs(text: string): Promise<boolean> {
  try {
    // Check cache first
    const cacheKey = text.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const cacheFile = `${FS.cacheDirectory}tts_${cacheKey}.mp3`;

    // Check if it is in our memory cache map
    if (!audioCache[text]) {
      // Fetch from backend
      const response = await fetch(`${API_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`TTS API error: ${response.status}`);

      // Save to file
      const blob = await response.blob();

      // Convert blob to base64 to write to file (React Native specific workaround)
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // remove data:audio/mpeg;base64, prefix
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await FS.writeAsStringAsync(cacheFile, base64Data, {
        encoding: FS.EncodingType.Base64,
      });

      audioCache[text] = cacheFile;
    }

    // Play audio
    await unloadSound();
    const { sound } = await Audio.Sound.createAsync({ uri: audioCache[text] });
    soundObject = sound;
    await sound.playAsync();

    return true;
  } catch (error) {
    console.warn("ElevenLabs TTS failed, falling back to local:", error);
    return false;
  }
}

/**
 * Speaks the traffic signal state if it has changed
 * Only announces when the state actually changes (not on every detection)
 */
export async function speakSignalState(
  state: SignalState,
  colorblindType: ColorblindnessType,
  force = false,
): Promise<void> {
  // Only announce when state actually changes (or if forced)
  if (!force && state === lastSpokenState) {
    return;
  }

  // Don't announce unknown state
  if (state === "unknown") {
    return;
  }

  const message = getSignalMessage(state, colorblindType);
  if (!message) return;

  // Stop any current speech (native or audio)
  await stopSpeaking();

  // Use ElevenLabs if enabled, otherwise use Expo Speech
  if (USE_ELEVENLABS) {
    const played = await speakElevenLabs(message);
    if (!played) {
      Speech.speak(message, {
        language: "en-US",
        pitch: 1.0,
        rate: 1.1,
      });
    }
  } else {
    Speech.speak(message, {
      language: "en-US",
      pitch: 1.0,
      rate: 1.1, // Slightly faster for urgency
      ...(state === "red" && { pitch: 0.9, rate: 1.0 }),
      ...(state === "yellow" && { rate: 1.2 }),
    });
  }

  lastSpokenState = state;
}

/**
 * Speaks a custom message (for onboarding, errors, etc.)
 */
export async function speak(message: string): Promise<void> {
  await stopSpeaking();

  if (USE_ELEVENLABS) {
    const played = await speakElevenLabs(message);
    if (!played) {
      Speech.speak(message, {
        language: "en-US",
        pitch: 1.0,
        rate: 1.0,
      });
    }
  } else {
    Speech.speak(message, {
      language: "en-US",
      pitch: 1.0,
      rate: 1.0,
    });
  }
}

/**
 * Stops any current speech
 */
export async function stopSpeaking(): Promise<void> {
  await Speech.stop(); // Stop native TTS
  await unloadSound(); // Stop audio playback
}

/**
 * Checks if TTS is currently speaking
 */
export async function isSpeaking(): Promise<boolean> {
  const nativeSpeaking = await Speech.isSpeakingAsync();
  let audioPlaying = false;
  if (soundObject) {
    const status = await soundObject.getStatusAsync();
    if (status.isLoaded) {
      audioPlaying = status.isPlaying;
    }
  }
  return nativeSpeaking || audioPlaying;
}

/**
 * Resets the speech state (useful when resuming the app)
 */
export function resetSpeechState(): void {
  lastSpokenState = null;
}
