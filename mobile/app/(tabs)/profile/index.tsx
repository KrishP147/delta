/**
 * Profile Overview Screen
 *
 * Shows the user's color vision profile and provides access to:
 * - Color vision test (take/retake)
 * - Settings
 * - Profile information
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants/accessibility";
import {
  useAppStore,
  ColorBlindnessType,
  Severity,
} from "../../../store/useAppStore";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    hasCompletedOnboarding,
    colorVisionProfile,
    alertSettings,
    transportSettings,
  } = useAppStore();

  const handleTakeTest = () => {
    router.push("/(tabs)/profile/test");
  };

  const handleSettings = () => {
    router.push("/(tabs)/profile/settings");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>
            Customize TrueLight for your vision needs
          </Text>
        </View>

        {/* Color Vision Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Color Vision</Text>
            {colorVisionProfile.testDate && (
              <Text style={styles.cardSubtitle}>
                Tested {formatDate(colorVisionProfile.testDate)}
              </Text>
            )}
          </View>

          <View style={styles.visionResult}>
            <View
              style={[
                styles.visionIndicator,
                {
                  backgroundColor: getVisionColor(colorVisionProfile.type),
                },
              ]}
            />
            <View style={styles.visionInfo}>
              <Text style={styles.visionType}>
                {getVisionTypeLabel(colorVisionProfile.type)}
              </Text>
              {colorVisionProfile.type !== "unknown" &&
                colorVisionProfile.type !== "normal" && (
                  <Text style={styles.visionSeverity}>
                    {formatSeverity(colorVisionProfile.severity)} •{" "}
                    {Math.round(colorVisionProfile.confidence * 100)}% confidence
                  </Text>
                )}
            </View>
          </View>

          {/* Problematic colors */}
          {colorVisionProfile.type !== "unknown" &&
            colorVisionProfile.type !== "normal" && (
              <View style={styles.colorsSection}>
                <Text style={styles.colorsSectionTitle}>
                  Colors We Watch For
                </Text>
                <View style={styles.colorChips}>
                  {colorVisionProfile.problematicColors.red && (
                    <View style={[styles.colorChip, { backgroundColor: COLORS.red }]}>
                      <Text style={styles.colorChipText}>Red</Text>
                    </View>
                  )}
                  {colorVisionProfile.problematicColors.green && (
                    <View style={[styles.colorChip, { backgroundColor: COLORS.green }]}>
                      <Text style={styles.colorChipText}>Green</Text>
                    </View>
                  )}
                  {colorVisionProfile.problematicColors.blue && (
                    <View style={[styles.colorChip, { backgroundColor: "#007AFF" }]}>
                      <Text style={styles.colorChipText}>Blue</Text>
                    </View>
                  )}
                  {colorVisionProfile.problematicColors.yellow && (
                    <View style={[styles.colorChip, { backgroundColor: COLORS.yellow }]}>
                      <Text style={[styles.colorChipText, { color: "#000" }]}>Yellow</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

          <Pressable
            style={styles.testButton}
            onPress={handleTakeTest}
            accessibilityRole="button"
            accessibilityLabel={
              hasCompletedOnboarding
                ? "Retake color vision test"
                : "Take color vision test"
            }
          >
            <Text style={styles.testButtonText}>
              {hasCompletedOnboarding ? "RETAKE TEST" : "TAKE VISION TEST"}
            </Text>
          </Pressable>
        </View>

        {/* Quick Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Settings</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Transport Mode</Text>
            <Text style={styles.statValue}>
              {formatTransportMode(transportSettings.currentMode)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Alert Level</Text>
            <Text style={styles.statValue}>
              {formatAlertLevel(alertSettings.alertLevel)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Position Cues</Text>
            <Text style={styles.statValue}>
              {alertSettings.positionCuesEnabled ? "On" : "Off"}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Voice</Text>
            <Text style={styles.statValue}>
              {alertSettings.voiceProvider === "elevenlabs"
                ? "ElevenLabs"
                : "System Voice"}
            </Text>
          </View>
        </View>

        {/* Settings Button */}
        <Pressable
          style={styles.settingsButton}
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="Open app settings"
        >
          <Text style={styles.settingsButtonText}>Settings</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </Pressable>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            TrueLight uses your color vision profile to provide targeted alerts for
            objects and signals you may have difficulty seeing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getVisionTypeLabel(type: ColorBlindnessType): string {
  const labels: Record<ColorBlindnessType, string> = {
    normal: "Normal Color Vision",
    protanopia: "Protanopia (Red-Blind)",
    protanomaly: "Protanomaly (Red-Weak)",
    deuteranopia: "Deuteranopia (Green-Blind)",
    deutanomaly: "Deuteranomaly (Green-Weak)",
    tritanopia: "Tritanopia (Blue-Blind)",
    tritanomaly: "Tritanomaly (Blue-Weak)",
    achromatopsia: "Achromatopsia (Monochromacy)",
    low_vision: "Low Vision Mode",
    unknown: "Not Yet Tested",
  };
  return labels[type];
}

function getVisionColor(type: ColorBlindnessType): string {
  if (type === "unknown") return COLORS.unknown;
  if (type === "normal") return COLORS.green;
  return COLORS.yellow;
}

function formatSeverity(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

function formatTransportMode(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function formatAlertLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.spacingLarge,
  },
  header: {
    marginBottom: SIZES.spacingLarge,
  },
  title: {
    fontSize: SIZES.textLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacingSmall,
  },
  subtitle: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    marginBottom: SIZES.spacingMedium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.spacingMedium,
  },
  cardTitle: {
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  visionResult: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.spacingMedium,
  },
  visionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.spacingMedium,
  },
  visionInfo: {
    flex: 1,
  },
  visionType: {
    fontSize: SIZES.textSmall,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  visionSeverity: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  colorsSection: {
    marginTop: SIZES.spacingMedium,
    marginBottom: SIZES.spacingMedium,
  },
  colorsSectionTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingSmall,
  },
  colorChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.spacingSmall,
  },
  colorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  colorChipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: COLORS.green,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    marginTop: SIZES.spacingSmall,
  },
  testButtonText: {
    color: COLORS.background,
    fontSize: SIZES.textSmall,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.spacingSmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: SIZES.textSmall,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  settingsButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.spacingLarge,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.spacingLarge,
  },
  settingsButtonText: {
    fontSize: SIZES.textSmall,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  settingsArrow: {
    fontSize: SIZES.textMedium,
    color: COLORS.textSecondary,
  },
  infoSection: {
    padding: SIZES.spacingMedium,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
