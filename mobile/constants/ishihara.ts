/**
 * Color Vision Test Data
 *
 * Uses a simplified color discrimination test with multiple choice answers.
 * This is more reliable than rendering Ishihara plates programmatically.
 *
 * APPROACH:
 * We show colored circles and ask users to identify which colors they see.
 * This directly tests color discrimination rather than pattern recognition.
 *
 * For a production app, consider integrating:
 * - EnChroma's color blind test API
 * - Colorlite test
 * - Or licensed Ishihara plate images
 */

import { ColorblindnessType } from "./accessibility";

export interface TestQuestion {
  id: number;
  // The question to ask
  question: string;
  // Colors shown to the user (will render as colored circles)
  colors: string[];
  // Multiple choice options
  options: string[];
  // What someone with normal vision would answer
  normalAnswer: string;
  // What someone with red-green colorblindness might answer
  redGreenAnswer: string | null;
  // Description for accessibility
  description: string;
}

/**
 * Color discrimination test questions
 * These test the ability to distinguish between similar colors
 */
export const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: "What colors do you see?",
    colors: ["#E63946", "#2A9D8F"], // Red and Teal
    options: [
      "Red and Green",
      "Red and Blue",
      "Brown and Brown",
      "I'm not sure",
    ],
    normalAnswer: "Red and Green",
    redGreenAnswer: "Brown and Brown",
    description: "Two colored circles side by side",
  },
  {
    id: 2,
    question: "Which circle is RED?",
    colors: ["#6B8E23", "#DC143C", "#6B8E23"], // Olive, Crimson, Olive
    options: ["Left", "Middle", "Right", "I can't tell"],
    normalAnswer: "Middle",
    redGreenAnswer: "I can't tell",
    description: "Three colored circles in a row",
  },
  {
    id: 3,
    question: "Which circle is GREEN?",
    colors: ["#DC143C", "#228B22", "#DC143C"], // Crimson, Forest Green, Crimson
    options: ["Left", "Middle", "Right", "I can't tell"],
    normalAnswer: "Middle",
    redGreenAnswer: "I can't tell",
    description: "Three colored circles in a row",
  },
  {
    id: 4,
    question: "What color is this circle?",
    colors: ["#FF6347"], // Tomato red
    options: ["Red", "Green", "Orange", "Brown"],
    normalAnswer: "Red",
    redGreenAnswer: "Brown",
    description: "A single colored circle",
  },
  {
    id: 5,
    question: "What color is this circle?",
    colors: ["#32CD32"], // Lime green
    options: ["Red", "Green", "Yellow", "Brown"],
    normalAnswer: "Green",
    redGreenAnswer: "Brown",
    description: "A single colored circle",
  },
];

// Quick 3-question test for faster onboarding
export const QUICK_TEST_IDS = [1, 2, 5];

export interface TestResponse {
  questionId: number;
  answer: string;
}

/**
 * Analyzes test responses to determine colorblindness type
 */
export function analyzeColorVision(responses: TestResponse[]): {
  type: ColorblindnessType;
  confidence: "high" | "medium" | "low";
  description: string;
} {
  let normalMatches = 0;
  let redGreenMatches = 0;
  let unsureCount = 0;

  for (const response of responses) {
    const question = TEST_QUESTIONS.find((q) => q.id === response.questionId);
    if (!question) continue;

    const answer = response.answer;

    if (answer.includes("not sure") || answer.includes("can't tell")) {
      unsureCount++;
      continue;
    }

    if (answer === question.normalAnswer) {
      normalMatches++;
    }
    if (question.redGreenAnswer && answer === question.redGreenAnswer) {
      redGreenMatches++;
    }
  }

  const total = responses.length;

  // If user was unsure about most questions, likely has difficulty
  if (unsureCount >= total * 0.6) {
    return {
      type: "low_vision",
      confidence: "medium",
      description:
        "You may have difficulty distinguishing some colors. We'll use enhanced audio with position cues.",
    };
  }

  // Strong normal vision
  if (normalMatches >= total * 0.8) {
    return {
      type: "normal",
      confidence: "high",
      description: "Your color vision appears normal.",
    };
  }

  // Red-green colorblindness indicators
  if (
    redGreenMatches >= 2 ||
    (normalMatches < total * 0.5 && unsureCount >= 1)
  ) {
    return {
      type: "deuteranopia", // Most common type
      confidence: redGreenMatches >= 2 ? "high" : "medium",
      description:
        "You may have red-green color vision deficiency. We'll add position cues to help identify traffic signals.",
    };
  }

  // Mixed results
  if (normalMatches < total * 0.7) {
    return {
      type: "protanopia",
      confidence: "low",
      description:
        "You may have some color vision differences. We'll use enhanced descriptions to help.",
    };
  }

  return {
    type: "normal",
    confidence: "medium",
    description: "Your color vision appears mostly normal.",
  };
}
