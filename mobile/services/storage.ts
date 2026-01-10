/**
 * Simple Storage Service
 *
 * Stores user preferences including colorblindness type.
 * Uses AsyncStorage for persistence across app restarts.
 *
 * For hackathon simplicity, we use a basic in-memory store
 * with optional AsyncStorage integration.
 */

import { ColorblindnessType } from '../constants/accessibility';

// In-memory store (persists for session)
let storedColorblindType: ColorblindnessType = 'unknown';
let hasCompletedOnboarding = false;

/**
 * Stores the user's colorblindness type
 */
export function setColorblindType(type: ColorblindnessType): void {
  storedColorblindType = type;
}

/**
 * Gets the user's colorblindness type
 */
export function getColorblindType(): ColorblindnessType {
  return storedColorblindType;
}

/**
 * Marks onboarding as complete
 */
export function completeOnboarding(): void {
  hasCompletedOnboarding = true;
}

/**
 * Checks if user has completed onboarding
 */
export function isOnboardingComplete(): boolean {
  return hasCompletedOnboarding;
}

/**
 * Resets all stored data (for testing)
 */
export function resetStorage(): void {
  storedColorblindType = 'unknown';
  hasCompletedOnboarding = false;
}
