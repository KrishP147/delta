/**
 * Enhanced Ishihara-style Color Vision Test Data
 *
 * Expanded test with 10 plates for more accurate diagnosis.
 * Includes plates that can differentiate between:
 * - Protanopia vs Deuteranopia
 * - Severe vs mild forms (protanomaly, deuteranomaly)
 * - Tritanopia (blue-yellow blindness)
 */

import {
  ColorBlindnessType,
  Severity,
  getProblematicColorsForType,
  getSeverityForType,
} from "../store/useAppStore";

export interface TestPlate {
  id: number;
  // What someone with normal vision should see
  normalAnswer: string;
  // What someone with specific colorblindness sees
  protanAnswer: string | null; // Red-blind
  deutanAnswer: string | null; // Green-blind
  tritanAnswer: string | null; // Blue-blind
  // Colors for rendering the plate
  backgroundColor: string;
  foregroundColor: string;
  // Multiple choice options
  options: string[];
  // What this plate tests for
  testType: "protan-deutan" | "protan-only" | "deutan-only" | "tritan" | "general";
  // Description for accessibility
  description: string;
}

export const TEST_PLATES: TestPlate[] = [
  // Plate 1: General screening - everyone with normal vision sees 12
  {
    id: 1,
    normalAnswer: "12",
    protanAnswer: null,
    deutanAnswer: null,
    tritanAnswer: "12", // Tritans see this normally
    backgroundColor: "#74B72E",
    foregroundColor: "#D62828",
    options: ["12", "17", "21", "Can't see"],
    testType: "protan-deutan",
    description: "Red number on green background - tests red-green vision",
  },
  // Plate 2: Differentiation plate
  {
    id: 2,
    normalAnswer: "8",
    protanAnswer: "3",
    deutanAnswer: "3",
    tritanAnswer: "8",
    backgroundColor: "#FFB703",
    foregroundColor: "#219EBC",
    options: ["8", "3", "6", "Can't see"],
    testType: "general",
    description: "Blue number on yellow background",
  },
  // Plate 3: Red-green screening
  {
    id: 3,
    normalAnswer: "29",
    protanAnswer: "70",
    deutanAnswer: "70",
    tritanAnswer: "29",
    backgroundColor: "#8ECAE6",
    foregroundColor: "#FB8500",
    options: ["29", "70", "27", "Can't see"],
    testType: "protan-deutan",
    description: "Orange number on light blue background",
  },
  // Plate 4: Protan differentiation
  {
    id: 4,
    normalAnswer: "5",
    protanAnswer: "2",
    deutanAnswer: "2",
    tritanAnswer: "5",
    backgroundColor: "#90BE6D",
    foregroundColor: "#F94144",
    options: ["5", "2", "8", "Can't see"],
    testType: "protan-deutan",
    description: "Red number on yellow-green background",
  },
  // Plate 5: Red-green confusion
  {
    id: 5,
    normalAnswer: "74",
    protanAnswer: "21",
    deutanAnswer: "21",
    tritanAnswer: "74",
    backgroundColor: "#43AA8B",
    foregroundColor: "#F3722C",
    options: ["74", "21", "71", "Can't see"],
    testType: "protan-deutan",
    description: "Orange-red number on teal background",
  },
  // Plate 6: Protan-specific (protans see different from deutans)
  {
    id: 6,
    normalAnswer: "45",
    protanAnswer: null, // Can't see
    deutanAnswer: "45", // Deutans can still see (partial)
    tritanAnswer: "45",
    backgroundColor: "#E63946",
    foregroundColor: "#2A9D8F",
    options: ["45", "15", "54", "Can't see"],
    testType: "protan-only",
    description: "Teal number on red background - tests protan specifically",
  },
  // Plate 7: Deutan-specific
  {
    id: 7,
    normalAnswer: "6",
    protanAnswer: "6", // Protans can partially see
    deutanAnswer: null, // Deutans can't see
    tritanAnswer: "6",
    backgroundColor: "#2A9D8F",
    foregroundColor: "#E63946",
    options: ["6", "9", "8", "Can't see"],
    testType: "deutan-only",
    description: "Red number on teal background - tests deutan specifically",
  },
  // Plate 8: Tritan screening (blue-yellow)
  {
    id: 8,
    normalAnswer: "26",
    protanAnswer: "26",
    deutanAnswer: "26",
    tritanAnswer: null, // Tritans can't see
    backgroundColor: "#FFD60A",
    foregroundColor: "#3A86FF",
    options: ["26", "62", "20", "Can't see"],
    testType: "tritan",
    description: "Blue number on yellow background - tests blue-yellow vision",
  },
  // Plate 9: Another tritan test
  {
    id: 9,
    normalAnswer: "42",
    protanAnswer: "42",
    deutanAnswer: "42",
    tritanAnswer: "14",
    backgroundColor: "#8338EC",
    foregroundColor: "#FFBE0B",
    options: ["42", "14", "24", "Can't see"],
    testType: "tritan",
    description: "Yellow number on purple background",
  },
  // Plate 10: Final confirmation
  {
    id: 10,
    normalAnswer: "97",
    protanAnswer: null,
    deutanAnswer: null,
    tritanAnswer: "97",
    backgroundColor: "#06D6A0",
    foregroundColor: "#EF476F",
    options: ["97", "79", "67", "Can't see"],
    testType: "protan-deutan",
    description: "Pink-red number on green background",
  },
];

// Quick test uses 5 plates for faster assessment
export const QUICK_TEST_PLATE_IDS = [1, 3, 4, 6, 8];

// Full test uses all 10 plates
export const FULL_TEST_PLATE_IDS = TEST_PLATES.map((p) => p.id);

export interface TestResponse {
  plateId: number;
  answer: string;
}

export interface TestResult {
  type: ColorBlindnessType;
  severity: Severity;
  confidence: number;
  description: string;
  problematicColors: {
    red: boolean;
    green: boolean;
    blue: boolean;
    yellow: boolean;
  };
}

/**
 * Analyzes test responses to determine colorblindness type
 */
export function analyzeColorVision(responses: TestResponse[]): TestResult {
  let normalMatches = 0;
  let protanMatches = 0;
  let deutanMatches = 0;
  let tritanMatches = 0;
  let noAnswerCount = 0;

  // Track specific plate results for differentiation
  let protanOnlyFailed = false;
  let deutanOnlyFailed = false;
  let tritanFailed = false;

  for (const response of responses) {
    const plate = TEST_PLATES.find((p) => p.id === response.plateId);
    if (!plate) continue;

    const answer = response.answer.toLowerCase().trim();
    const cantSee = answer.includes("can't see") || answer.includes("cant see");

    if (cantSee) {
      noAnswerCount++;

      // Track which specific tests failed
      if (plate.testType === "protan-only") protanOnlyFailed = true;
      if (plate.testType === "deutan-only") deutanOnlyFailed = true;
      if (plate.testType === "tritan") tritanFailed = true;
      continue;
    }

    // Check normal answer
    if (answer === plate.normalAnswer.toLowerCase()) {
      normalMatches++;
    }

    // Check colorblind answers
    if (plate.protanAnswer && answer === plate.protanAnswer.toLowerCase()) {
      protanMatches++;
    }
    if (plate.deutanAnswer && answer === plate.deutanAnswer.toLowerCase()) {
      deutanMatches++;
    }
    if (plate.tritanAnswer && answer === plate.tritanAnswer.toLowerCase()) {
      // Tritan answers often match normal for non-tritan plates
    }

    // Track tritan-specific failures
    if (plate.testType === "tritan") {
      if (plate.tritanAnswer && answer === plate.tritanAnswer.toLowerCase()) {
        tritanMatches++;
      }
    }
  }

  const total = responses.length;
  const normalRatio = normalMatches / total;

  // Decision logic

  // If user couldn't see most plates, likely low vision or achromatopsia
  if (noAnswerCount >= total * 0.7) {
    return {
      type: "achromatopsia",
      severity: "severe",
      confidence: 0.7,
      description:
        "You may have significant difficulty seeing colors. We'll use maximum audio assistance.",
      problematicColors: { red: true, green: true, blue: true, yellow: true },
    };
  }

  if (noAnswerCount >= total * 0.5) {
    return {
      type: "low_vision",
      severity: "severe",
      confidence: 0.6,
      description:
        "You may have low vision or difficulty distinguishing colors. Enhanced audio descriptions enabled.",
      problematicColors: { red: true, green: true, blue: true, yellow: true },
    };
  }

  // Strong normal vision
  if (normalRatio >= 0.9) {
    return {
      type: "normal",
      severity: "mild",
      confidence: 0.95,
      description: "Your color vision appears normal. Standard alerts enabled.",
      problematicColors: { red: false, green: false, blue: false, yellow: false },
    };
  }

  // Check for tritanopia (blue-yellow) - rare but should check first
  if (tritanFailed || tritanMatches >= 2) {
    const isSevere = noAnswerCount >= 2;
    return {
      type: isSevere ? "tritanopia" : "tritanomaly",
      severity: isSevere ? "severe" : "mild",
      confidence: 0.7,
      description:
        "You may have difficulty with blue and yellow colors. We'll help you identify these.",
      problematicColors: { red: false, green: false, blue: true, yellow: true },
    };
  }

  // Check for red-green colorblindness
  const redGreenScore = protanMatches + deutanMatches;

  if (redGreenScore >= 2) {
    // Try to differentiate protan vs deutan
    let type: ColorBlindnessType;
    let description: string;

    if (protanOnlyFailed && !deutanOnlyFailed) {
      // Protan-specific plate failed
      const isSevere = protanMatches >= 3 || noAnswerCount >= 2;
      type = isSevere ? "protanopia" : "protanomaly";
      description = isSevere
        ? "You have difficulty seeing red. We'll provide extra alerts for red signals and lights."
        : "You may have mild red color weakness. Position cues enabled for red signals.";
    } else if (deutanOnlyFailed && !protanOnlyFailed) {
      // Deutan-specific plate failed
      const isSevere = deutanMatches >= 3 || noAnswerCount >= 2;
      type = isSevere ? "deuteranopia" : "deutanomaly";
      description = isSevere
        ? "You have difficulty seeing green. We'll provide extra alerts for green signals."
        : "You may have mild green color weakness. Position cues enabled for green signals.";
    } else {
      // Can't differentiate - use general red-green classification
      const isSevere = redGreenScore >= 4 || noAnswerCount >= 2;
      // Default to deuteranopia as it's more common
      type = isSevere ? "deuteranopia" : "deutanomaly";
      description =
        "You may have red-green color vision deficiency. Position cues and enhanced alerts enabled.";
    }

    return {
      type,
      severity: getSeverityForType(type),
      confidence: redGreenScore >= 4 ? 0.85 : 0.7,
      description,
      problematicColors: getProblematicColorsForType(type),
    };
  }

  // Moderate normal with some issues
  if (normalRatio >= 0.6) {
    return {
      type: "normal",
      severity: "mild",
      confidence: 0.7,
      description:
        "Your color vision is mostly normal. Standard alerts with optional position cues available.",
      problematicColors: { red: false, green: false, blue: false, yellow: false },
    };
  }

  // Inconclusive
  return {
    type: "unknown",
    severity: "moderate",
    confidence: 0.4,
    description:
      "We couldn't determine your exact color vision type. Enhanced descriptions enabled for safety.",
    problematicColors: { red: true, green: true, blue: false, yellow: false },
  };
}

/**
 * Get a friendly description of the colorblindness type
 */
export function getTypeDescription(type: ColorBlindnessType): string {
  const descriptions: Record<ColorBlindnessType, string> = {
    normal: "You can see the full range of colors normally.",
    protanopia:
      "Red colors appear dark or black. Red-orange and red-brown colors are difficult to distinguish.",
    protanomaly:
      "Red colors appear weaker or more muted. Some red shades may be confused with brown or green.",
    deuteranopia:
      "Green colors are difficult to see. Green and red can appear similar.",
    deutanomaly:
      "Green colors appear weaker. Some green shades may be confused with red or brown.",
    tritanopia:
      "Blue and yellow colors are difficult to distinguish. Blue may appear greenish.",
    tritanomaly:
      "Blue and yellow colors appear weaker or muted.",
    achromatopsia:
      "Complete color blindness - seeing only in shades of gray. Very rare condition.",
    low_vision:
      "General difficulty seeing or distinguishing visual details.",
    unknown: "Color vision type not yet determined.",
  };
  return descriptions[type];
}
