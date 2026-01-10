/**
 * Camera Detection Screen
 *
 * The main screen where traffic signal detection happens.
 * Uses the camera to capture frames and analyzes them for traffic signals.
 *
 * ACCESSIBILITY:
 * - Full-screen camera for easy aiming
 * - Large, visible signal display
 * - Audio feedback for all state changes
 * - Simple controls
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, ColorblindnessType } from "../constants/accessibility";
import { CameraViewComponent } from "../components/CameraView";
import { getColorblindType } from "../services/storage";
import { speak, stopSpeaking } from "../services/speech";
import { checkHealth, API_BASE_URL } from "../services/api";

export default function CameraScreen() {
  const router = useRouter();
  const [colorblindType, setColorblindType] =
    useState<ColorblindnessType>("unknown");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user's colorblind type
    setColorblindType(getColorblindType());

    // Check backend connectivity
    checkBackendConnection();

    // Announce screen
    speak("Camera ready. Point at a traffic signal.");

    return () => {
      stopSpeaking();
    };
  }, []);

  const checkBackendConnection = async () => {
    const healthy = await checkHealth();
    setIsConnected(healthy);
    if (!healthy) {
      setError(`Cannot connect to server at ${API_BASE_URL}`);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Don't spam errors - just show once
    if (!error) {
      speak("Detection error. Check your connection.");
    }
  };

  const handleSettings = () => {
    Alert.alert("Settings", "Would you like to retake the vision test?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Retake Test",
        onPress: () => router.replace("/test"),
      },
      {
        text: "Go Home",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  // Show connection error
  if (isConnected === false) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.errorScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>
            Cannot connect to the detection server.
          </Text>
          <Text style={styles.errorDetails}>
            Make sure the backend is running at:{"\n"}
            {API_BASE_URL}
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={checkBackendConnection}
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>RETRY</Text>
          </Pressable>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/")}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isConnected === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.loadingScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.loadingText}>Connecting to server...</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraViewComponent
        colorblindType={colorblindType}
        onError={handleError}
      />

      {/* Settings button */}
      <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
        <Pressable
          style={styles.settingsButton}
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </SafeAreaView>

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={() => setError(null)}>
            <Text style={styles.dismissText}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: SIZES.spacingMedium,
  },
  settingsButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  loadingScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.spacingLarge,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.textMedium,
  },
  errorScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.spacingLarge,
  },
  errorTitle: {
    fontSize: SIZES.textLarge,
    fontWeight: "bold",
    color: COLORS.red,
    marginBottom: SIZES.spacingMedium,
  },
  errorMessage: {
    fontSize: SIZES.textMedium,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.spacingMedium,
  },
  errorDetails: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.spacingLarge,
  },
  retryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: SIZES.spacingLarge * 2,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.spacingMedium,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
  },
  backButton: {
    padding: SIZES.spacingMedium,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.textSmall,
  },
  errorBanner: {
    position: "absolute",
    top: 100,
    left: SIZES.spacingMedium,
    right: SIZES.spacingMedium,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    padding: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorBannerText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textSmall,
    flex: 1,
  },
  dismissText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    padding: 8,
  },
});
