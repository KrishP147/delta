/**
 * Color Vision Test Screen
 *
 * A simple color discrimination test with multiple choice answers.
 * Much more reliable than rendering Ishihara patterns.
 *
 * ACCESSIBILITY:
 * - Large, tappable option buttons
 * - Clear progress indication
 * - No typing required
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/accessibility";
import {
  TEST_QUESTIONS,
  QUICK_TEST_IDS,
  TestResponse,
  analyzeColorVision,
} from "../constants/ishihara";
import { ColorTestPlate } from "../components/ColorTestPlate";
import { setColorblindType, completeOnboarding } from "../services/storage";
import { speak } from "../services/speech";

export default function ColorTestScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<TestResponse[]>([]);

  // Use quick test (3 questions) for faster onboarding
  const testQuestions = QUICK_TEST_IDS.map(
    (id) => TEST_QUESTIONS.find((q) => q.id === id)!,
  );
  const currentQuestion = testQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;

  const handleSelectOption = (option: string) => {
    // Record response
    const newResponses: TestResponse[] = [
      ...responses,
      { questionId: currentQuestion.id, answer: option },
    ];
    setResponses(newResponses);

    if (isLastQuestion) {
      // Analyze results and navigate
      finishTest(newResponses);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      speak(`Question ${currentQuestionIndex + 2} of ${testQuestions.length}`);
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
            {currentQuestionIndex + 1} of {testQuestions.length}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {/* Color display */}
        <ColorTestPlate question={currentQuestion} />

        {/* Multiple choice options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
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
  },
  progressContainer: {
    width: "100%",
    marginBottom: SIZES.spacingLarge,
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
    marginBottom: SIZES.spacingMedium,
  },
  optionsContainer: {
    marginTop: SIZES.spacingLarge,
    gap: SIZES.spacingMedium,
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
    fontSize: SIZES.textMedium,
    fontWeight: "600",
  },
});
