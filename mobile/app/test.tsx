/**
 * Color Vision Test Screen
 *
 * A simplified Ishihara-style test with multiple choice answers.
 * Shows colored circle patterns forming numbers.
 *
 * ACCESSIBILITY:
 * - Large, tappable option buttons
 * - Clear progress indication
 * - No typing required
 */

import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/accessibility";
import {
  TEST_PLATES,
  QUICK_TEST_PLATE_IDS,
  TestResponse,
  analyzeColorVision,
} from "../constants/ishihara";
import { ColorTestPlate } from "../components/ColorTestPlate";
import { setColorblindType, completeOnboarding } from "../services/storage";
import { speak } from "../services/speech";

export default function ColorTestScreen() {
  const router = useRouter();
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [responses, setResponses] = useState<TestResponse[]>([]);

  // Use 10-plate test for comprehensive onboarding
  const testPlates = QUICK_TEST_PLATE_IDS.map(
    (id) => TEST_PLATES.find((p) => p.id === id)!,
  );
  const currentPlate = testPlates[currentPlateIndex];
  const isLastPlate = currentPlateIndex === testPlates.length - 1;
  const progress = ((currentPlateIndex + 1) / testPlates.length) * 100;

  // Shuffle function for randomizing answer order
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Randomize options for current plate (memoized so it doesn't change on re-render)
  const shuffledOptions = useMemo(
    () => shuffleArray(currentPlate.options),
    [currentPlate.id]
  );

  const handleSelectOption = (option: string) => {
    // Record response
    const newResponses: TestResponse[] = [
      ...responses,
      { plateId: currentPlate.id, answer: option },
    ];
    setResponses(newResponses);

    if (isLastPlate) {
      // Analyze results and navigate
      finishTest(newResponses);
    } else {
      // Move to next plate
      setCurrentPlateIndex(currentPlateIndex + 1);
      speak(`Plate ${currentPlateIndex + 2} of ${testPlates.length}`);
    }
  };

  const finishTest = (finalResponses: TestResponse[]) => {
    const result = analyzeColorVision(finalResponses);

    // Save result
    setColorblindType(result.type);
    completeOnboarding();

    // Announce result
    speak(result.description);

    // Navigate to camera
    router.replace("/camera");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentPlateIndex + 1} of {testPlates.length}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>What number do you see?</Text>

        {/* Ishihara plate with colored circles */}
        <ColorTestPlate plate={currentPlate} />

        {/* Multiple choice options - randomized */}
        <View style={styles.optionsContainer}>
          {shuffledOptions.map((option, index) => (
            <Pressable
              key={index}
              style={styles.optionButton}
              onPress={() => handleSelectOption(option)}
              accessibilityRole="button"
              accessibilityLabel={option}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
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
    fontSize: SIZES.textSmall,
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
  optionText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
});
