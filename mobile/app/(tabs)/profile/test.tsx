/**
 * Enhanced Color Vision Test Screen
 *
 * Comprehensive Ishihara-style test with 5-10 plates.
 * Supports quick (5 plates) or full (10 plates) assessment.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants/accessibility";
import {
  TEST_PLATES,
  QUICK_TEST_PLATE_IDS,
  FULL_TEST_PLATE_IDS,
  TestResponse,
  analyzeColorVision,
} from "../../../constants/ishiharaEnhanced";
import { ColorTestPlate } from "../../../components/ColorTestPlate";
import { useAppStore } from "../../../store/useAppStore";
import { speak } from "../../../services/speech";

type TestMode = "quick" | "full";

export default function ColorTestScreen() {
  const router = useRouter();
  const { setOnboardingComplete, setColorVisionProfile } = useAppStore();

  const [testMode, setTestMode] = useState<TestMode | null>(null);
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [responses, setResponses] = useState<TestResponse[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Get plates based on test mode
  const plateIds =
    testMode === "full" ? FULL_TEST_PLATE_IDS : QUICK_TEST_PLATE_IDS;
  const testPlates = plateIds.map((id) => TEST_PLATES.find((p) => p.id === id)!);
  const currentPlate = testPlates[currentPlateIndex];
  const isLastPlate = currentPlateIndex === testPlates.length - 1;
  const progress = ((currentPlateIndex + 1) / testPlates.length) * 100;

  useEffect(() => {
    if (testMode) {
      speak(`Starting ${testMode} color vision test. Plate 1 of ${testPlates.length}`);
    }
  }, [testMode]);

  const handleSelectOption = (option: string) => {
    const newResponses: TestResponse[] = [
      ...responses,
      { plateId: currentPlate.id, answer: option },
    ];
    setResponses(newResponses);

    if (isLastPlate) {
      finishTest(newResponses);
    } else {
      setCurrentPlateIndex(currentPlateIndex + 1);
      speak(`Plate ${currentPlateIndex + 2} of ${testPlates.length}`);
    }
  };

  const finishTest = (finalResponses: TestResponse[]) => {
    const result = analyzeColorVision(finalResponses);

    // Save to store
    setColorVisionProfile({
      type: result.type,
      severity: result.severity,
      confidence: result.confidence,
      testDate: new Date().toISOString(),
      problematicColors: result.problematicColors,
    });
    setOnboardingComplete(true);

    // Announce result
    speak(result.description);

    // Show results
    setShowResults(true);
  };

  const handleContinue = () => {
    router.back();
  };

  const handleRetake = () => {
    setTestMode(null);
    setCurrentPlateIndex(0);
    setResponses([]);
    setShowResults(false);
  };

  // Test mode selection screen
  if (!testMode) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.modeSelectContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modeTitle}>Color Vision Assessment</Text>
          <Text style={styles.modeDescription}>
            This test will help us customize alerts based on your color vision.
            Choose a test mode:
          </Text>

          <Pressable
            style={styles.modeCard}
            onPress={() => setTestMode("quick")}
            accessibilityRole="button"
          >
            <View style={styles.modeCardHeader}>
              <Text style={styles.modeCardTitle}>Quick Test</Text>
              <Text style={styles.modeCardBadge}>~1 min</Text>
            </View>
            <Text style={styles.modeCardDescription}>
              5 plates - Good for a fast assessment. Identifies major color vision types.
            </Text>
          </Pressable>

          <Pressable
            style={styles.modeCard}
            onPress={() => setTestMode("full")}
            accessibilityRole="button"
          >
            <View style={styles.modeCardHeader}>
              <Text style={styles.modeCardTitle}>Full Test</Text>
              <Text style={[styles.modeCardBadge, styles.recommendedBadge]}>
                Recommended
              </Text>
            </View>
            <Text style={styles.modeCardDescription}>
              10 plates - More accurate diagnosis. Can differentiate between similar types.
            </Text>
          </Pressable>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              You'll see colored dot patterns with numbers hidden inside. Select
              the number you see, or "Can't see" if no number is visible.
            </Text>
            <Text style={styles.infoText}>
              This is not a medical diagnosis - it helps personalize your TrueLight
              experience.
            </Text>
          </View>

          <Pressable
            style={styles.skipButton}
            onPress={() => {
              Alert.alert(
                "Skip Test?",
                "We'll use enhanced audio mode which provides maximum assistance. You can take the test later from your profile.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Skip",
                    onPress: () => {
                      setColorVisionProfile({
                        type: "low_vision",
                        severity: "moderate",
                        confidence: 0.5,
                        testDate: null,
                        problematicColors: {
                          red: true,
                          green: true,
                          blue: true,
                          yellow: true,
                        },
                      });
                      setOnboardingComplete(true);
                      router.back();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Results screen
  if (showResults) {
    const result = analyzeColorVision(responses);

    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsTitle}>Test Complete</Text>

          <View style={styles.resultCard}>
            <View
              style={[
                styles.resultIndicator,
                {
                  backgroundColor:
                    result.type === "normal" ? COLORS.green : COLORS.yellow,
                },
              ]}
            />
            <Text style={styles.resultType}>
              {getVisionTypeLabel(result.type)}
            </Text>
            <Text style={styles.resultConfidence}>
              {Math.round(result.confidence * 100)}% confidence
            </Text>
          </View>

          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{result.description}</Text>
          </View>

          {result.type !== "normal" && result.type !== "unknown" && (
            <View style={styles.adaptationsCard}>
              <Text style={styles.adaptationsTitle}>
                What we'll do for you:
              </Text>
              <View style={styles.adaptationItem}>
                <Text style={styles.adaptationBullet}>•</Text>
                <Text style={styles.adaptationText}>
                  Add position cues (top/middle/bottom) for traffic lights
                </Text>
              </View>
              <View style={styles.adaptationItem}>
                <Text style={styles.adaptationBullet}>•</Text>
                <Text style={styles.adaptationText}>
                  Prioritize alerts for colors you have difficulty with
                </Text>
              </View>
              <View style={styles.adaptationItem}>
                <Text style={styles.adaptationBullet}>•</Text>
                <Text style={styles.adaptationText}>
                  Use shape indicators in addition to colors
                </Text>
              </View>
            </View>
          )}

          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
            accessibilityRole="button"
          >
            <Text style={styles.continueButtonText}>CONTINUE</Text>
          </Pressable>

          <Pressable
            style={styles.retakeButton}
            onPress={handleRetake}
            accessibilityRole="button"
          >
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Test screen
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.testContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Plate {currentPlateIndex + 1} of {testPlates.length}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>What number do you see?</Text>

        {/* Plate hint */}
        <Text style={styles.plateHint}>{currentPlate.description}</Text>

        {/* Ishihara plate */}
        <ColorTestPlate plate={currentPlate} />

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentPlate.options.map((option, index) => (
            <Pressable
              key={index}
              style={[
                styles.optionButton,
                option.includes("Can't") && styles.cantSeeButton,
              ]}
              onPress={() => handleSelectOption(option)}
              accessibilityRole="button"
              accessibilityLabel={option}
            >
              <Text
                style={[
                  styles.optionText,
                  option.includes("Can't") && styles.cantSeeText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getVisionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    normal: "Normal Color Vision",
    protanopia: "Protanopia (Red-Blind)",
    protanomaly: "Protanomaly (Red-Weak)",
    deuteranopia: "Deuteranopia (Green-Blind)",
    deutanomaly: "Deuteranomaly (Green-Weak)",
    tritanopia: "Tritanopia (Blue-Blind)",
    tritanomaly: "Tritanomaly (Blue-Weak)",
    achromatopsia: "Achromatopsia",
    low_vision: "Low Vision",
    unknown: "Undetermined",
  };
  return labels[type] || type;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Mode selection styles
  modeSelectContent: {
    flexGrow: 1,
    padding: SIZES.spacingLarge,
  },
  modeTitle: {
    fontSize: SIZES.textLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.spacingMedium,
  },
  modeDescription: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.spacingLarge,
    lineHeight: 24,
  },
  modeCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    marginBottom: SIZES.spacingMedium,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  modeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.spacingSmall,
  },
  modeCardTitle: {
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  modeCardBadge: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedBadge: {
    backgroundColor: COLORS.green,
    color: COLORS.background,
  },
  modeCardDescription: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    marginTop: SIZES.spacingMedium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  infoTitle: {
    fontSize: SIZES.textSmall,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSmall,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.spacingSmall,
  },
  skipButton: {
    marginTop: SIZES.spacingLarge,
    padding: SIZES.spacingMedium,
    alignItems: "center",
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.textSmall,
  },
  // Test styles
  testContent: {
    flexGrow: 1,
    padding: SIZES.spacingLarge,
    alignItems: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: SIZES.spacingMedium,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 4,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  question: {
    fontSize: SIZES.textLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.spacingSmall,
  },
  plateHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.spacingMedium,
  },
  optionsContainer: {
    width: "100%",
    marginTop: SIZES.spacingMedium,
    gap: SIZES.spacingSmall,
  },
  optionButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SIZES.buttonPadding,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cantSeeButton: {
    borderColor: COLORS.unknown,
    borderStyle: "dashed",
  },
  optionText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    fontWeight: "600",
  },
  cantSeeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.textSmall,
  },
  // Results styles
  resultsContent: {
    flexGrow: 1,
    padding: SIZES.spacingLarge,
    alignItems: "center",
  },
  resultsTitle: {
    fontSize: SIZES.textLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingLarge,
  },
  resultCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    alignItems: "center",
    width: "100%",
    marginBottom: SIZES.spacingMedium,
  },
  resultIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: SIZES.spacingMedium,
  },
  resultType: {
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  resultConfidence: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  descriptionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    width: "100%",
    marginBottom: SIZES.spacingMedium,
  },
  descriptionText: {
    fontSize: SIZES.textSmall,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  adaptationsCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    width: "100%",
    marginBottom: SIZES.spacingLarge,
  },
  adaptationsTitle: {
    fontSize: SIZES.textSmall,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingMedium,
  },
  adaptationItem: {
    flexDirection: "row",
    marginBottom: SIZES.spacingSmall,
  },
  adaptationBullet: {
    color: COLORS.green,
    fontSize: SIZES.textSmall,
    marginRight: SIZES.spacingSmall,
  },
  adaptationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: SIZES.spacingLarge * 2,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
    width: "100%",
    alignItems: "center",
    marginBottom: SIZES.spacingMedium,
  },
  continueButtonText: {
    color: COLORS.background,
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  retakeButton: {
    padding: SIZES.spacingMedium,
  },
  retakeButtonText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.textSmall,
  },
});
