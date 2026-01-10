/**
 * CameraView Component
 *
 * Captures camera frames and sends them to the backend for analysis.
 * Optimized for real-time traffic signal detection.
 *
 * IMPLEMENTATION NOTES:
 * - Captures frames at configurable intervals (default 800ms)
 * - Compresses images to reduce upload size and latency
 * - Handles camera permissions gracefully
 * - Provides visual feedback during capture
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SIZES, TIMING, SignalState, ColorblindnessType } from '../constants/accessibility';
import { detectSignal, DetectionResponse } from '../services/api';
import { speakSignalState, resetSpeechState } from '../services/speech';
import { SignalDisplay } from './SignalDisplay';

interface Props {
  colorblindType: ColorblindnessType;
  onError?: (error: string) => void;
}

export function CameraViewComponent({ colorblindType, onError }: Props) {
  const cameraRef = useRef<ExpoCameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(true);
  const [currentState, setCurrentState] = useState<SignalState>('unknown');
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
        quality: 0.3, // Low quality for speed
        skipProcessing: true, // Skip post-processing for speed
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture image');
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
      console.error('Capture error:', error);
      onError?.(error instanceof Error ? error.message : 'Detection failed');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isCapturing, colorblindType, onError]);

  // Start/stop capture interval
  useEffect(() => {
    if (isCapturing && permission?.granted) {
      // Reset speech state when starting
      resetSpeechState();

      // Start capture interval
      captureIntervalRef.current = setInterval(captureFrame, TIMING.captureInterval);
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [isCapturing, permission?.granted, captureFrame]);

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
          Delta needs camera access to detect traffic signals and help keep you safe.
        </Text>
        <Pressable
          style={styles.button}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel="Grant camera permission"
        >
          <Text style={styles.buttonText}>Enable Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera preview */}
      <View style={styles.cameraContainer}>
        <ExpoCameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <View style={styles.processingDot} />
            </View>
          )}
        </ExpoCameraView>
      </View>

      {/* Signal display overlay */}
      <View style={styles.signalOverlay}>
        <SignalDisplay
          state={currentState}
          confidence={confidence}
          colorblindType={colorblindType}
        />
      </View>

      {/* Pause/Resume button */}
      <Pressable
        style={[styles.controlButton, !isCapturing && styles.controlButtonPaused]}
        onPress={() => setIsCapturing(!isCapturing)}
        accessibilityRole="button"
        accessibilityLabel={isCapturing ? 'Pause detection' : 'Resume detection'}
      >
        <Text style={styles.controlButtonText}>
          {isCapturing ? 'PAUSE' : 'RESUME'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  processingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  processingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    opacity: 0.8,
  },
  signalOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: SIZES.spacingMedium,
  },
  controlButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: COLORS.buttonBackground,
    paddingHorizontal: SIZES.spacingLarge,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
    minWidth: 150,
    alignItems: 'center',
  },
  controlButtonPaused: {
    backgroundColor: COLORS.green,
  },
  controlButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    fontWeight: 'bold',
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    textAlign: 'center',
    marginHorizontal: SIZES.spacingLarge,
    marginBottom: SIZES.spacingLarge,
  },
  button: {
    backgroundColor: COLORS.green,
    paddingHorizontal: SIZES.spacingLarge,
    paddingVertical: SIZES.buttonPadding,
    borderRadius: SIZES.borderRadius,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textMedium,
    fontWeight: 'bold',
  },
});
