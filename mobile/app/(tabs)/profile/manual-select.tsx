/**
 * Manual Colorblindness Type Selection Screen
 *
 * Allows users to manually select their colorblindness type
 * without retaking the full test.
 */

import React from "react";
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
  useAppStore,
  ColorBlindnessType,
} from "../../../store/useAppStore";

const COLORBLINDNESS_TYPES: {
  type: ColorBlindnessType;
  label: string;
  description: string;
  affectedColors: string[];
}[] = [
  {
    type: "normal",
    label: "Normal Vision",
    description: "No color vision deficiency",
    affectedColors: [],
  },
  {
    type: "protanopia",
    label: "Protanopia",
    description: "Red-blind (severe)",
    affectedColors: ["Red", "Green"],
  },
  {
    type: "protanomaly",
    label: "Protanomaly",
    description: "Red-weak (mild)",
    affectedColors: ["Red"],
  },
  {
    type: "deuteranopia",
    label: "Deuteranopia",
    description: "Green-blind (severe)",
    affectedColors: ["Red", "Green"],
  },
  {
    type: "deuteranomaly",
    label: "Deuteranomaly",
    description: "Green-weak (mild)",
    affectedColors: ["Green"],
  },
  {
    type: "tritanopia",
    label: "Tritanopia",
    description: "Blue-blind (severe)",
    affectedColors: ["Blue", "Yellow"],
  },
  {
    type: "tritanomaly",
    label: "Tritanomaly",
    description: "Blue-weak (mild)",
    affectedColors: ["Blue"],
  },
  {
    type: "achromatopsia",
    label: "Achromatopsia",
    description: "Complete color blindness",
    affectedColors: ["All colors"],
  },
  {
    type: "low_vision",
    label: "Low Vision",
    description: "General visual impairment",
    affectedColors: [],
  },
];

export default function ManualSelectScreen() {
  const router = useRouter();
  const { colorVisionProfile, setColorVisionProfile } = useAppStore();

  const handleSelectType = (type: ColorBlindnessType) => {
    const selectedType = COLORBLINDNESS_TYPES.find((t) => t.type === type);
    if (!selectedType) return;

    Alert.alert(
      "Confirm Selection",
      `Set your color vision type to ${selectedType.label}?\n\n${selectedType.description}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // Determine problematic colors based on type
            const problematicColors = {
              red: selectedType.affectedColors.includes("Red") || 
                   selectedType.affectedColors.includes("All colors"),
              green: selectedType.affectedColors.includes("Green") || 
                     selectedType.affectedColors.includes("All colors"),
              blue: selectedType.affectedColors.includes("Blue") || 
                    selectedType.affectedColors.includes("All colors"),
              yellow: selectedType.affectedColors.includes("Yellow") || 
                      selectedType.affectedColors.includes("All colors"),
            };

            // Determine severity
            let severity: "mild" | "moderate" | "severe" = "moderate";
            if (type.includes("anomaly")) {
              severity = "mild";
            } else if (
              type === "protanopia" ||
              type === "deuteranopia" ||
              type === "tritanopia" ||
              type === "achromatopsia"
            ) {
              severity = "severe";
            }

            setColorVisionProfile({
              type,
              severity,
              confidence: 1.0, // Manually selected = 100% confidence
              testDate: new Date().toISOString(),
              problematicColors,
            });

            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Vision Type</Text>
          <Text style={styles.subtitle}>
            Choose your colorblindness type. This helps TrueLight customize
            alerts for your specific needs.
          </Text>
        </View>

        {/* Current Selection */}
        {colorVisionProfile.type !== "unknown" && (
          <View style={styles.currentCard}>
            <Text style={styles.currentLabel}>Current Type</Text>
            <Text style={styles.currentValue}>
              {COLORBLINDNESS_TYPES.find(
                (t) => t.type === colorVisionProfile.type
              )?.label || "Unknown"}
            </Text>
          </View>
        )}

        {/* Type Selection List */}
        <View style={styles.typesList}>
          {COLORBLINDNESS_TYPES.map((item) => (
            <Pressable
              key={item.type}
              style={[
                styles.typeCard,
                colorVisionProfile.type === item.type && styles.typeCardActive,
              ]}
              onPress={() => handleSelectType(item.type)}
            >
              <View style={styles.typeInfo}>
                <Text style={styles.typeLabel}>{item.label}</Text>
                <Text style={styles.typeDescription}>{item.description}</Text>
                {item.affectedColors.length > 0 && (
                  <Text style={styles.affectedColors}>
                    Affected: {item.affectedColors.join(", ")}
                  </Text>
                )}
              </View>
              {colorVisionProfile.type === item.type && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 Not sure? Take the quick vision test to get a recommendation, or
            consult your eye care professional for an accurate diagnosis.
          </Text>
        </View>

        {/* Retake Test Button */}
        <Pressable
          style={styles.retakeButton}
          onPress={() => {
            router.back();
            router.push("/(tabs)/profile/test");
          }}
        >
          <Text style={styles.retakeButtonText}>Take Vision Test Instead</Text>
        </Pressable>
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
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  currentCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.green,
    marginBottom: 24,
  },
  currentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  typesList: {
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeCardActive: {
    borderColor: COLORS.green,
    borderWidth: 2,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  affectedColors: {
    fontSize: 12,
    color: COLORS.yellow,
    fontStyle: "italic",
  },
  checkmark: {
    fontSize: 24,
    color: COLORS.green,
    marginLeft: 12,
  },
  infoSection: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.yellow,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  retakeButton: {
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
