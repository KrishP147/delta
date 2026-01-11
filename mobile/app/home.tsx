/**
 * True Light - Home Screen
 *
 * Dark mode, minimal design - no gradients, no purple/blue, sharp corners
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, ColorblindnessType } from "../constants/accessibility";
import {
  getColorblindType,
  setColorblindType,
  completeOnboarding,
  isOnboardingComplete,
} from "../services/storage";
import { speak } from "../services/speech";
import { useAuth } from "../contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type SelectableType = Exclude<ColorblindnessType, "unknown">;

const VISION_TYPES: {
  type: SelectableType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    type: "normal",
    label: "Normal Vision",
    description: "No color vision deficiency",
    icon: "👁️",
  },
  {
    type: "protanopia",
    label: "Protanopia",
    description: "Difficulty seeing red",
    icon: "🔴",
  },
  {
    type: "deuteranopia",
    label: "Deuteranopia",
    description: "Difficulty seeing green",
    icon: "🟢",
  },
  {
    type: "tritanopia",
    label: "Tritanopia",
    description: "Difficulty seeing blue/yellow",
    icon: "🔵",
  },
  {
    type: "low_vision",
    label: "Low Vision",
    description: "Enhanced audio descriptions",
    icon: "🔊",
  },
];

// Quick stat component
function QuickStat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.quickStat}>
      <Text style={styles.quickStatIcon}>{icon}</Text>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedType, setSelectedType] = useState<SelectableType>("normal");
  const [userColorblindType, setUserColorblindType] = useState<ColorblindnessType>("unknown");

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const onboardingDone = isOnboardingComplete();
    const savedType = getColorblindType();
    setUserColorblindType(savedType);
    
    if (!onboardingDone || savedType === "unknown") {
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const handleSelectVisionType = (type: SelectableType) => {
    setSelectedType(type);
    speak(`Selected ${type === "normal" ? "normal vision" : type}`);
  };

  const handleConfirmVisionType = () => {
    setColorblindType(selectedType);
    setUserColorblindType(selectedType);
    completeOnboarding();
    setShowOnboarding(false);
    speak("Profile saved. Ready to start.");
  };

  const handleTakeTest = () => {
    router.push("/test");
  };

  const handleStartDashcam = () => {
    router.push("/camera");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Onboarding screen
  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.onboardingContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.onboardingHeader}>
            <Text style={styles.onboardingLogo}>◉</Text>
            <Text style={styles.onboardingTitle}>TRUE LIGHT</Text>
            <Text style={styles.onboardingSubtitle}>
              Real-time driving assistance for color vision
            </Text>
          </View>

          {/* Setup card */}
          <View style={styles.setupCard}>
            <Text style={styles.setupCardTitle}>Quick Setup</Text>
            <View style={styles.setupStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Select your vision type below</Text>
            </View>
            <View style={styles.setupStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Start dashcam mode</Text>
            </View>
            <View style={styles.setupStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Receive voice alerts for relevant colors</Text>
            </View>
          </View>

          {/* Vision type selection */}
          <Text style={styles.sectionTitle}>SELECT VISION TYPE</Text>
          <View style={styles.visionTypeGrid}>
            {VISION_TYPES.map((vt) => (
              <Pressable
                key={vt.type}
                style={[
                  styles.visionTypeCard,
                  selectedType === vt.type && styles.visionTypeCardSelected,
                ]}
                onPress={() => handleSelectVisionType(vt.type)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedType === vt.type }}
              >
                {selectedType === vt.type && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
                <Text style={styles.visionTypeIcon}>{vt.icon}</Text>
                <Text style={[
                  styles.visionTypeLabel,
                  selectedType === vt.type && styles.visionTypeLabelSelected
                ]}>
                  {vt.label}
                </Text>
                <Text style={styles.visionTypeDesc}>{vt.description}</Text>
              </Pressable>
            ))}
          </View>

          {/* Test option */}
          <Pressable style={styles.testOption} onPress={handleTakeTest}>
            <Text style={styles.testOptionIcon}>🔬</Text>
            <View style={styles.testOptionTextContainer}>
              <Text style={styles.testOptionTitle}>Not sure?</Text>
              <Text style={styles.testOptionDesc}>Take color vision test</Text>
            </View>
            <Text style={styles.testOptionArrow}>→</Text>
          </Pressable>

          {/* Confirm button */}
          <Pressable style={styles.confirmButton} onPress={handleConfirmVisionType}>
            <Text style={styles.confirmButtonText}>CONTINUE</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main home screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.greeting}>
                Welcome{user ? `, ${user.username}` : ""}
              </Text>
              <Text style={styles.appTitle}>TRUE LIGHT</Text>
            </View>
          </View>
          <Pressable style={styles.avatarButton} onPress={handleLogout}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() || "U"}
            </Text>
          </Pressable>
        </View>

        {/* Vision profile */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>VISION PROFILE</Text>
            <Pressable onPress={handleSettings}>
              <Text style={styles.editButton}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.profileContent}>
            <View style={styles.profileIconContainer}>
              <Text style={styles.profileIcon}>
                {getVisionIcon(userColorblindType)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileType}>
                {getVisionTypeLabel(userColorblindType)}
              </Text>
              <Text style={styles.profileDesc}>
                {getVisionTypeDescription(userColorblindType)}
              </Text>
            </View>
          </View>
        </View>

        {/* Main action - Dashcam */}
        <Pressable style={styles.mainActionCard} onPress={handleStartDashcam}>
          <View style={styles.mainActionContent}>
            <View style={styles.mainActionIconContainer}>
              <Text style={styles.mainActionIcon}>◉</Text>
            </View>
            <View style={styles.mainActionText}>
              <Text style={styles.mainActionTitle}>START DASHCAM</Text>
              <Text style={styles.mainActionDesc}>
                Real-time detection with voice alerts
              </Text>
            </View>
            <Text style={styles.mainActionArrow}>→</Text>
          </View>
          <View style={styles.mainActionTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Object Detection</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Voice Alerts</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Tracking</Text>
            </View>
          </View>
        </Pressable>

        {/* Secondary actions */}
        <View style={styles.actionRow}>
          <Pressable style={styles.actionCard} onPress={handleTakeTest}>
            <Text style={styles.actionIcon}>🔬</Text>
            <Text style={styles.actionTitle}>Vision Test</Text>
            <Text style={styles.actionDesc}>Retake test</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={handleSettings}>
            <Text style={styles.actionIcon}>⚙</Text>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionDesc}>Customize</Text>
          </Pressable>
        </View>

        {/* Quick stats */}
        <View style={styles.statsContainer}>
          <QuickStat icon="◉" value="Live" label="Detection" />
          <QuickStat icon="🔊" value="Auto" label="Alerts" />
          <QuickStat icon="◎" value="On" label="Tracking" />
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>TIP</Text>
          <Text style={styles.tipText}>
            Mount your phone on the dashboard for best results. The app only
            alerts for colors difficult for your vision type.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getVisionTypeLabel(type: ColorblindnessType): string {
  switch (type) {
    case "normal": return "Normal Vision";
    case "protanopia": return "Protanopia";
    case "deuteranopia": return "Deuteranopia";
    case "tritanopia": return "Tritanopia";
    case "protanomaly": return "Protanomaly";
    case "deuteranomaly": return "Deuteranomaly";
    case "low_vision": return "Low Vision";
    default: return "Not Set";
  }
}

function getVisionTypeDescription(type: ColorblindnessType): string {
  switch (type) {
    case "normal": return "Voice alerts disabled";
    case "protanopia": return "Alerts for red colors";
    case "deuteranopia": return "Alerts for green colors";
    case "tritanopia": return "Alerts for blue/yellow";
    case "protanomaly": return "Alerts for red colors (mild)";
    case "deuteranomaly": return "Alerts for green colors (mild)";
    case "low_vision": return "Full audio descriptions";
    default: return "Set up your profile";
  }
}

function getVisionIcon(type: ColorblindnessType): string {
  switch (type) {
    case "normal": return "👁️";
    case "protanopia":
    case "protanomaly": return "🔴";
    case "deuteranopia":
    case "deuteranomaly": return "🟢";
    case "tritanopia": return "🔵";
    case "low_vision": return "🔊";
    default: return "❓";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: SIZES.spacingMedium,
    fontSize: SIZES.textMedium,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  // Profile Card
  profileCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  profileTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  editButton: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: "600",
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.backgroundTertiary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileIcon: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileType: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Main action card
  mainActionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  mainActionContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mainActionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.accentDim,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mainActionIcon: {
    fontSize: 24,
    color: COLORS.accent,
  },
  mainActionText: {
    flex: 1,
  },
  mainActionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainActionDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  mainActionArrow: {
    fontSize: 24,
    color: COLORS.accent,
    fontWeight: "bold",
  },
  mainActionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // Action row
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
  },
  quickStatIcon: {
    fontSize: 20,
    marginBottom: 8,
    color: COLORS.accent,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Tip
  tipCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Onboarding styles
  onboardingContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  onboardingHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  onboardingLogo: {
    fontSize: 48,
    color: COLORS.accent,
    marginBottom: 12,
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  setupCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  setupCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  setupStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.accent,
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 28,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 16,
    letterSpacing: 1,
  },
  // Vision type grid
  visionTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  visionTypeCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  visionTypeCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.backgroundTertiary,
  },
  visionTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  visionTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  visionTypeLabelSelected: {
    color: COLORS.accent,
  },
  visionTypeDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Test option
  testOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  testOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  testOptionTextContainer: {
    flex: 1,
  },
  testOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  testOptionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  testOptionArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
