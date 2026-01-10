/**
 * Ishihara-style Color Vision Test Data
 *
 * We use a simplified 5-plate test to quickly identify the type of
 * colorblindness. This is NOT a medical diagnosis - it's a quick
 * assessment to customize the app experience.
 *
 * Each plate shows a number formed by colored circles that:
 * - People with normal vision see one number
 * - People with specific colorblindness see a different number (or nothing)
 */

import { ColorblindnessType } from "./accessibility";

export interface TestPlate {
  id: number;
  // What someone with normal vision should see
  normalAnswer: string;
  // What someone with protanopia (red-blind) might see
  protanAnswer: string | null;
  // What someone with deuteranopia (green-blind) might see
  deutanAnswer: string | null;
  // Colors used in this plate (for rendering)
  backgroundColor: string;
  foregroundColor: string;
  // Multiple choice options to display
  options: string[];
  // Description for accessibility
  description: string;
}

export const TEST_PLATES: TestPlate[] = [
  {
    id: 1,
    normalAnswer: "12",
    protanAnswer: null, // Cannot see
    deutanAnswer: null, // Cannot see
    backgroundColor: "#74B72E", // Green dots
    foregroundColor: "#D62828", // Red number
    options: ["12", "17", "21", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 2,
    normalAnswer: "8",
    protanAnswer: "3",
    deutanAnswer: "3",
    backgroundColor: "#FFB703", // Yellow/orange dots
    foregroundColor: "#219EBC", // Blue-ish number
    options: ["8", "3", "6", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 3,
    normalAnswer: "29",
    protanAnswer: "70",
    deutanAnswer: "70",
    backgroundColor: "#8ECAE6", // Light blue dots
    foregroundColor: "#FB8500", // Orange number
    options: ["29", "70", "27", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 4,
    normalAnswer: "5",
    protanAnswer: "2",
    deutanAnswer: "2",
    backgroundColor: "#90BE6D", // Yellow-green dots
    foregroundColor: "#F94144", // Red number
    options: ["5", "2", "8", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 5,
    normalAnswer: "74",
    protanAnswer: "21",
    deutanAnswer: "21",
    backgroundColor: "#43AA8B", // Teal dots
    foregroundColor: "#F3722C", // Orange-red number
    options: ["74", "21", "71", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 6,
    normalAnswer: "45",
    protanAnswer: null,
    deutanAnswer: null,
    backgroundColor: "#7CB518", // Green dots
    foregroundColor: "#E63946", // Red number
    options: ["45", "54", "15", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 7,
    normalAnswer: "6",
    protanAnswer: "5",
    deutanAnswer: "5",
    backgroundColor: "#FFB4A2", // Peachy pink dots
    foregroundColor: "#6D6875", // Purple-gray number
    options: ["6", "5", "9", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 8,
    normalAnswer: "16",
    protanAnswer: null,
    deutanAnswer: null,
    backgroundColor: "#52B788", // Green dots
    foregroundColor: "#D00000", // Red number
    options: ["16", "61", "18", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 9,
    normalAnswer: "42",
    protanAnswer: "4",
    deutanAnswer: "2",
    backgroundColor: "#FFDD00", // Yellow dots
    foregroundColor: "#1982C4", // Blue number
    options: ["42", "4", "2", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
  {
    id: 10,
    normalAnswer: "97",
    protanAnswer: null,
    deutanAnswer: null,
    backgroundColor: "#80ED99", // Light green dots
    foregroundColor: "#FF5733", // Orange-red number
    options: ["97", "79", "67", "Can't see"],
    description: "A circle of colored dots with a number hidden inside",
  },
];

/**
 * Full 10-question test for comprehensive assessment
 */
export const QUICK_TEST_PLATE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface TestResponse {
  plateId: number;
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
  let protanMatches = 0;
  let deutanMatches = 0;
  let noAnswerCount = 0;

  for (const response of responses) {
    const plate = TEST_PLATES.find((p) => p.id === response.plateId);
    if (!plate) continue;

    const answer = response.answer.toLowerCase().trim();

    if (answer.includes("can't see")) {
      noAnswerCount++;
      continue;
    }

    if (answer === plate.normalAnswer.toLowerCase()) {
      normalMatches++;
    }
    if (plate.protanAnswer && answer === plate.protanAnswer.toLowerCase()) {
      protanMatches++;
    }
    if (plate.deutanAnswer && answer === plate.deutanAnswer.toLowerCase()) {
      deutanMatches++;
    }
  }

  const total = responses.length;

  // If user couldn't see most plates, likely low vision
  if (noAnswerCount >= total * 0.6) {
    return {
      type: "low_vision",
      confidence: "medium",
      description:
        "You may have low vision or difficulty seeing the test images. We'll use enhanced audio descriptions.",
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

  // Check for red-green colorblindness patterns
  if (protanMatches >= 2 || deutanMatches >= 2) {
    // Both protanopia and deuteranopia give similar results on simplified tests
    // In a real app, we'd use more specific plates to differentiate
    const type = protanMatches > deutanMatches ? "protanopia" : "deuteranopia";
    return {
      type,
      confidence: protanMatches >= 3 || deutanMatches >= 3 ? "high" : "medium",
      description:
        "You may have red-green color vision deficiency. We'll add position cues to help you identify traffic signals.",
    };
  }

  // Inconclusive
  return {
    type: "unknown",
    confidence: "low",
    description:
      "We couldn't determine your color vision type. We'll use enhanced descriptions to help.",
  };
}
