/**
 * Dashcam Screen
 *
 * Main detection screen with:
 * - Live camera feed (landscape optimized)
 * - Real-time hazard detection
 * - Speed-aware alert timing
 * - Transportation mode indicator
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";
import { COLORS, SIZES, SignalState } from "../../../constants/accessibility";
import { CameraViewComponent, CameraViewHandle } from "../../../components/CameraView";
import {
  useAppStore,
  getTransportModeFromSpeed,
  getCurrentAlertInterval,
} from "../../../store/useAppStore";
import { speak, stopSpeaking } from "../../../services/speech";
import { checkHealth, API_BASE_URL } from "../../../services/api";
import { SpeedDetector } from "../../../services/speedDetector";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function DashcamScreen() {
  const {
    colorVisionProfile,
    alertSettings,
    transportSettings,
    detectionSettings,
    currentSpeed,
    isRecording,
    activeHazards,
    setCurrentSpeed,
    setTransportMode,
    setIsRecording,
    setActiveHazards,
  } = useAppStore();

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSignal, setCurrentSignal] = useState<SignalState>("unknown");
  const [isLandscape, setIsLandscape] = useState(false);

  const speedDetectorRef = useRef<SpeedDetector | null>(null);
  const cameraViewRef = useRef<CameraViewHandle>(null);

  // Initialize speed detector
  useEffect(() => {
    speedDetectorRef.current = new SpeedDetector();

    const startSpeedTracking = async () => {
      if (speedDetectorRef.current) {
        await speedDetectorRef.current.startTracking((speed) => {
          setCurrentSpeed(speed);

          // Auto-detect transport mode if enabled
          if (transportSettings.autoDetectMode) {
            const detectedMode = getTransportModeFromSpeed(speed);
            if (detectedMode !== transportSettings.currentMode) {
              setTransportMode(detectedMode);
            }
          }
        });
      }
    };

    startSpeedTracking();

    return () => {
      if (speedDetectorRef.current) {
        speedDetectorRef.current.stopTracking();
      }
    };
  }, [transportSettings.autoDetectMode]);

  // Force landscape mode for dashcam
  useEffect(() => {
    const lockLandscape = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
      setIsLandscape(true);
    };
    lockLandscape();

    return () => {
      // Optionally restore portrait when leaving (or leave locked for dashcam mode)
      // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // Check backend connection
  useEffect(() => {
    checkBackendConnection();
    speak("Dashcam ready. Point at traffic signals.");

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
    if (!error) {
      speak("Detection error. Check your connection.");
    }
  };

  const handleDetection = useCallback(
    (state: SignalState, confidence: number) => {
      setCurrentSignal(state);
      if (state !== "unknown") {
        setActiveHazards(1);
      } else {
        setActiveHazards(0);
      }
    },
    []
  );

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (cameraViewRef.current) {
        await cameraViewRef.current.stopRecording();
      }
      setIsRecording(false);
      speak("Recording stopped. Clip saved.");
    } else {
      // Start recording
      if (cameraViewRef.current) {
        const success = await cameraViewRef.current.startRecording();
        if (success) {
          setIsRecording(true);
          speak("Recording started. Maximum 30 seconds.");
        } else {
          speak("Failed to start recording.");
        }
      }
    }
  };

  const toggleLandscape = async () => {
    if (isLandscape) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
    }
  };

  // Get mode icon
  const getModeIcon = () => {
    switch (transportSettings.currentMode) {
      case "walking":
        return "W";
      case "biking":
        return "B";
      case "driving":
        return "D";
      case "passenger":
        return "P";
      default:
        return "?";
    }
  };

  // Get signal color and shape
  const getSignalDisplay = () => {
    switch (currentSignal) {
      case "red":
        return { color: COLORS.red, shape: "square", label: "STOP" };
      case "yellow":
        return { color: COLORS.yellow, shape: "circle", label: "CAUTION" };
      case "green":
        return { color: COLORS.green, shape: "triangle", label: "GO" };
      default:
        return { color: COLORS.unknown, shape: "circle", label: "..." };
    }
  };

  const signalDisplay = getSignalDisplay();

  // Loading state
  if (isConnected === null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Connecting to server...</Text>
      </View>
    );
  }

  // Error state
  if (isConnected === false) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>
          Cannot connect to the detection server.
        </Text>
        <Text style={styles.errorDetails}>
          Make sure the backend is running at:{"\n"}
          {API_BASE_URL}
        </Text>
        <Pressable style={styles.retryButton} onPress={checkBackendConnection}>
          <Text style={styles.retryButtonText}>RETRY</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera feed */}
      <CameraViewComponent
        ref={cameraViewRef}
        colorblindType={colorVisionProfile.type}
        onError={handleError}
        onDetection={handleDetection}
      />

      {/* Top info bar */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <View style={styles.infoPanel}>
          {/* Speed indicator */}
          <View style={styles.infoPill}>
            <Text style={styles.infoPillValue}>
              {currentSpeed.toFixed(0)}
            </Text>
            <Text style={styles.infoPillUnit}>km/h</Text>
          </View>

          {/* Mode indicator */}
          <View style={styles.modePill}>
            <Text style={styles.modeIcon}>{getModeIcon()}</Text>
            <Text style={styles.modeText}>
              {transportSettings.currentMode.charAt(0).toUpperCase() +
                transportSettings.currentMode.slice(1)}
            </Text>
          </View>

          {/* Recording indicator */}
          {isRecording && (
            <View style={styles.recordingPill}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}
        </View>

        {/* Settings button */}
        <Pressable
          style={styles.settingsButton}
          onPress={toggleLandscape}
          accessibilityLabel={
            isLandscape ? "Switch to portrait" : "Switch to landscape"
          }
        >
          <Text style={styles.settingsIcon}>{isLandscape ? "□" : "▭"}</Text>
        </Pressable>
      </SafeAreaView>

      {/* Signal indicator */}
      {currentSignal !== "unknown" && (
        <View style={styles.signalIndicator}>
          <View
            style={[
              styles.signalShape,
              signalDisplay.shape === "square" && styles.signalSquare,
              signalDisplay.shape === "triangle" && styles.signalTriangle,
              { backgroundColor: signalDisplay.color },
            ]}
          />
          <Text style={styles.signalLabel}>{signalDisplay.label}</Text>
          {alertSettings.positionCuesEnabled && (
            <Text style={styles.positionCue}>
              {currentSignal === "red"
                ? "Top"
                : currentSignal === "yellow"
                ? "Middle"
                : "Bottom"}
            </Text>
          )}
        </View>
      )}

      {/* Bottom control bar */}
      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        {/* Profile indicator */}
        <View style={styles.profileIndicator}>
          <Text style={styles.profileLabel}>
            {getProfileLabel(colorVisionProfile.type)}
          </Text>
        </View>

        {/* Record button */}
        <Pressable
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
          ]}
          onPress={toggleRecording}
          accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
        >
          <View
            style={[
              styles.recordButtonInner,
              isRecording && styles.recordButtonInnerActive,
            ]}
          />
        </Pressable>

        {/* Hazard count */}
        <View style={styles.hazardIndicator}>
          <Text style={styles.hazardCount}>{activeHazards}</Text>
          <Text style={styles.hazardLabel}>Hazards</Text>
        </View>
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

function getProfileLabel(type: string): string {
  const labels: Record<string, string> = {
    normal: "Standard",
    protanopia: "Red-Enhanced",
    protanomaly: "Red-Enhanced",
    deuteranopia: "Green-Enhanced",
    deutanomaly: "Green-Enhanced",
    tritanopia: "Blue-Enhanced",
    tritanomaly: "Blue-Enhanced",
    achromatopsia: "Full Assist",
    low_vision: "Full Assist",
    unknown: "Adaptive",
  };
  return labels[type] || "Adaptive";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.spacingLarge,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.textMedium,
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
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: SIZES.spacingMedium,
  },
  infoPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spacingSmall,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoPillValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  infoPillUnit: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeIcon: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 6,
  },
  modeText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  recordingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textPrimary,
    marginRight: 6,
  },
  recordingText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
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
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  signalIndicator: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  signalShape: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  signalSquare: {
    borderRadius: 4,
  },
  signalTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 48,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  signalLabel: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
  },
  positionCue: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.spacingMedium,
  },
  profileIndicator: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
  },
  profileLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    textAlign: "center",
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 4,
    borderColor: COLORS.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonActive: {
    borderColor: COLORS.red,
  },
  recordButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.red,
  },
  recordButtonInnerActive: {
    borderRadius: 4,
    width: 24,
    height: 24,
  },
  hazardIndicator: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 100,
  },
  hazardCount: {
    color: COLORS.yellow,
    fontSize: 20,
    fontWeight: "bold",
  },
  hazardLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
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
