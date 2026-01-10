/**
 * CameraView Component
 *
 * Captures camera frames and sends them to the backend for analysis.
 * Optimized for real-time traffic signal detection.
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  CameraView as ExpoCameraView,
  useCameraPermissions,
} from "expo-camera";
import {
  COLORS,
  SIZES,
  TIMING,
  SignalState,
  ColorblindnessType,
  getSignalMessage,
} from "../constants/accessibility";
import { detectSignal, DetectionResponse } from "../services/api";
import { speakSignalState, resetSpeechState } from "../services/speech";

interface Props {
  colorblindType: ColorblindnessType;
  onError?: (error: string) => void;
}

export function CameraViewComponent({ colorblindType, onError }: Props) {
  const cameraRef = useRef<ExpoCameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(true);
  const [currentState, setCurrentState] = useState<SignalState>("unknown");
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Capture and analyze a frame
  const captureFrame = useCallback(async () => {
    if (!cameraRef.current || isProcessing || !isCapturing) return;

    try {
      setIsProcessing(true);

      // Capture a photo with reduced quality for faster upload
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
        skipProcessing: true,
        shutterSound: false, // Disable shutter sound
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture image");
      }

      // Send to backend for analysis
      const result: DetectionResponse = await detectSignal(photo.base64);

      // Update state
      setCurrentState(result.state);
      setConfidence(result.confidence);

      // Speak the result if confidence is high enough
      if (result.confidence >= TIMING.minConfidenceToAnnounce) {
        await speakSignalState(result.state, colorblindType);
      }
    } catch (error) {
      console.error("Capture error:", error);
      onError?.(error instanceof Error ? error.message : "Detection failed");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isCapturing, colorblindType, onError]);

  // Start/stop capture interval
  useEffect(() => {
    if (isCapturing && permission?.granted) {
      resetSpeechState();
      captureIntervalRef.current = setInterval(
        captureFrame,
        TIMING.captureInterval,
      );
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [isCapturing, permission?.granted, captureFrame]);

  // Get display info based on state
  const getStateColor = () => {
    switch (currentState) {
      case "red":
        return COLORS.red;
      case "yellow":
        return COLORS.yellow;
      case "green":
        return COLORS.green;
      default:
        return COLORS.unknown;
    }
  };

  const getStateLabel = () => {
    switch (currentState) {
      case "red":
        return "RED";
      case "yellow":
        return "YELLOW";
      case "green":
        return "GREEN";
      default:
        return "SCANNING";
    }
  };

  const getActionText = () => {
    if (currentState === "unknown") {
      return "Point camera at traffic light";
    }
    return getSignalMessage(currentState, colorblindType);
  };

  // Handle permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Delta needs camera access to detect traffic signals and help keep you
          safe.
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel="Grant camera permission"
        >
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </Pressable>
      </View>
    );
  }

  const stateColor = getStateColor();

  return (
    <View style={styles.container}>
      {/* Status bar at top */}
      <View style={styles.statusContainer}>
        {/* State indicator */}
        <View style={[styles.stateIndicator, { backgroundColor: stateColor }]}>
          <Text style={styles.stateText}>{getStateLabel()}</Text>
        </View>

        {/* Action description */}
        <View style={[styles.actionBar, { borderColor: stateColor }]}>
          <Text style={styles.actionText}>{getActionText()}</Text>
        </View>
      </View>

      {/* Camera preview - takes most of the screen */}
      <View style={styles.cameraContainer}>
        <ExpoCameraView ref={cameraRef} style={styles.camera} facing="back">
          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <View
                style={[styles.processingDot, { backgroundColor: stateColor }]}
              />
            </View>
          )}
        </ExpoCameraView>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[
            styles.controlButton,
            !isCapturing && styles.controlButtonPaused,
          ]}
          onPress={() => setIsCapturing(!isCapturing)}
          accessibilityRole="button"
          accessibilityLabel={
            isCapturing ? "Pause detection" : "Resume detection"
          }
        >
          <Text style={styles.controlButtonText}>
            {isCapturing ? "PAUSE" : "RESUME"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusContainer: {
    paddingTop: 60, // Account for status bar / notch
    paddingHorizontal: SIZES.spacingMedium,
    paddingBottom: SIZES.spacingMedium,
    backgroundColor: COLORS.background,
  },
  stateIndicator: {
    alignSelf: "center",
    paddingHorizontal: SIZES.spacingLarge * 2,
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.spacingSmall,
  },
  stateText: {
    color: COLORS.background,
    fontSize: SIZES.textXL,
    fontWeight: "bold",
    letterSpacing: 4,
    textAlign: "center",
  },
  actionBar: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SIZES.spacingMedium,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    textAlign: "center",
    fontWeight: "500",
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    marginHorizontal: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadius,
  },
  camera: {
    flex: 1,
  },
  processingIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  processingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.9,
  },
  bottomBar: {
    paddingVertical: SIZES.spacingMedium,
    paddingHorizontal: SIZES.spacingMedium,
    backgroundColor: COLORS.background,
  },
  controlButton: {
    alignSelf: "center",
    backgroundColor: COLORS.buttonBackground,
    paddingHorizontal: SIZES.spacingLarge * 2,
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadius,
  },
  controlButtonPaused: {
    backgroundColor: COLORS.green,
  },
  controlButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textSmall,
    fontWeight: "bold",
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    textAlign: "center",
    marginHorizontal: SIZES.spacingLarge,
    marginBottom: SIZES.spacingLarge,
    marginTop: 100,
  },
  permissionButton: {
    alignSelf: "center",
    backgroundColor: COLORS.green,
    paddingHorizontal: SIZES.spacingLarge,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
  },
  permissionButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    fontWeight: "bold",
  },
});
