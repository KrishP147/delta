/**
 * Welcome/Onboarding Screen
 *
 * The entry point of the app. Explains what Delta does and
 * guides users to take the color vision test before using the camera.
 *
 * ACCESSIBILITY:
 * - Large, readable text
 * - High contrast colors
 * - Clear call-to-action buttons
 * - Screen reader support
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, ColorblindnessType } from "../constants/accessibility";
import {
  isOnboardingComplete,
  getColorblindType,
  setColorblindType,
  completeOnboarding,
} from "../services/storage";
import { speak } from "../services/speech";

export default function WelcomeScreen() {
  const router = useRouter();
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [userColorblindType, setUserColorblindType] =
    useState<ColorblindnessType>("unknown");

  useEffect(() => {
    // Check if user has already completed onboarding
    const completed = isOnboardingComplete();
    setHasCompletedSetup(completed);
    if (completed) {
      setUserColorblindType(getColorblindType());
    }
  }, []);

  const handleStartTest = () => {
    speak("Starting color vision assessment");
    router.push("/test");
  };

  const handleSkipTest = () => {
    // Default to providing enhanced cues for safety
    setColorblindType("low_vision");
    completeOnboarding();
    speak("Skipping test. Using enhanced audio descriptions for safety.");
    router.push("/camera");
  };

  const handleStartCamera = () => {
    speak("Starting traffic signal detection");
    router.push("/camera");
  };

  const handleRetakeTest = () => {
    speak("Retaking color vision assessment");
    router.push("/test");
  };

  // If user has completed setup, show simplified home
  if (hasCompletedSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title} accessibilityRole="header">
            DELTA
          </Text>
          <Text style={styles.subtitle}>Traffic Signal Assistant</Text>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Your Settings</Text>
            <Text style={styles.statusValue}>
              {getVisionTypeLabel(userColorblindType)}
            </Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={handleStartCamera}
            accessibilityRole="button"
            accessibilityLabel="Start camera and begin detecting traffic signals"
          >
            <Text style={styles.primaryButtonText}>START DETECTION</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleRetakeTest}
            accessibilityRole="button"
            accessibilityLabel="Retake the color vision test"
          >
            <Text style={styles.secondaryButtonText}>Retake Vision Test</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // First-time onboarding
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} accessibilityRole="header">
          DELTA
        </Text>
        <Text style={styles.subtitle}>Traffic Signal Assistant</Text>

        <View style={styles.descriptionCard}>
          <Text style={styles.description}>
            Delta helps you navigate traffic signals safely by detecting lights
            and providing clear audio feedback.
          </Text>
          <Text style={styles.description}>
            Point your camera at traffic signals to hear announcements like "Red
            light - Stop" or "Green light - Safe to proceed."
          </Text>
        </View>

        <View style={styles.testPrompt}>
          <Text style={styles.testPromptTitle}>Quick Vision Assessment</Text>
          <Text style={styles.testPromptDescription}>
            Take a quick 30-second test so we can customize the app to work best
            for your vision.
          </Text>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={handleStartTest}
          accessibilityRole="button"
          accessibilityLabel="Start the color vision assessment test"
        >
          <Text style={styles.primaryButtonText}>TAKE VISION TEST</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={handleSkipTest}
          accessibilityRole="button"
          accessibilityLabel="Skip the test and use default settings"
        >
          <Text style={styles.secondaryButtonText}>
            Skip and use enhanced audio
          </Text>
        </Pressable>

        <Text style={styles.footer}>Your data stays on your device</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function getVisionTypeLabel(type: ColorblindnessType): string {
  switch (type) {
    case "normal":
      return "Standard mode";
    case "protanopia":
      return "Red-enhanced mode";
    case "deuteranopia":
      return "Green-enhanced mode";
    case "tritanopia":
      return "Blue-yellow mode";
    case "low_vision":
      return "Full audio descriptions";
    default:
      return "Adaptive mode";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.spacingLarge,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.spacingLarge,
  },
  title: {
    fontSize: SIZES.textXL + 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    letterSpacing: 8,
    marginBottom: SIZES.spacingSmall,
  },
  subtitle: {
    fontSize: SIZES.textMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingLarge * 2,
  },
  descriptionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    marginBottom: SIZES.spacingLarge,
    width: "100%",
  },
  description: {
    fontSize: SIZES.textSmall,
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: SIZES.spacingMedium,
  },
  testPrompt: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    marginBottom: SIZES.spacingLarge,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  testPromptTitle: {
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSmall,
  },
  testPromptDescription: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  statusCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    marginBottom: SIZES.spacingLarge * 2,
    width: "100%",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingSmall,
  },
  statusValue: {
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
    color: COLORS.green,
  },
  primaryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: SIZES.spacingLarge * 2,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.spacingMedium,
    minWidth: 250,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingHorizontal: SIZES.spacingLarge,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 250,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.textSmall,
  },
  footer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingLarge * 2,
    opacity: 0.6,
  },
});
