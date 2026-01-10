/**
 * SignalDisplay Component
 *
 * Shows the current traffic signal state in a large, accessible format.
 * Adapts to user's colorblindness type with appropriate visual cues.
 *
 * ACCESSIBILITY:
 * - Extra large text for visibility
 * - High contrast colors
 * - Position indicators for colorblind users
 * - Distinct shapes/patterns for each state
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  SignalState,
  ColorblindnessType,
  COLORS,
  SIZES,
  getColorblindAdjustments,
  getSignalMessage,
} from '../constants/accessibility';

interface Props {
  state: SignalState;
  confidence: number;
  colorblindType: ColorblindnessType;
}

const { width } = Dimensions.get('window');

export function SignalDisplay({ state, confidence, colorblindType }: Props) {
  const adjustments = getColorblindAdjustments(colorblindType);
  const message = getSignalMessage(state, colorblindType);

  const getStateColor = () => {
    switch (state) {
      case 'red':
        return adjustments.redColor || COLORS.red;
      case 'yellow':
        return adjustments.yellowColor || COLORS.yellow;
      case 'green':
        return adjustments.greenColor || COLORS.green;
      default:
        return COLORS.unknown;
    }
  };

  const getStateIcon = () => {
    // Use distinct shapes for colorblind users
    if (adjustments.usePatterns) {
      switch (state) {
        case 'red':
          return '■'; // Square = Stop
        case 'yellow':
          return '◆'; // Diamond = Caution
        case 'green':
          return '●'; // Circle = Go
        default:
          return '?';
      }
    }
    // Standard circular indicator for normal vision
    return '●';
  };

  const getPositionLabel = () => {
    if (!adjustments.showPositionIndicator) return null;
    switch (state) {
      case 'red':
        return 'TOP';
      case 'yellow':
        return 'MIDDLE';
      case 'green':
        return 'BOTTOM';
      default:
        return null;
    }
  };

  const stateColor = getStateColor();
  const positionLabel = getPositionLabel();

  return (
    <View style={styles.container}>
      {/* Traffic light position indicator for colorblind users */}
      {adjustments.showPositionIndicator && (
        <View style={styles.positionIndicator}>
          <View style={[styles.positionLight, state === 'red' && styles.positionActive]} />
          <View style={[styles.positionLight, state === 'yellow' && styles.positionActive]} />
          <View style={[styles.positionLight, state === 'green' && styles.positionActive]} />
        </View>
      )}

      {/* Main signal indicator */}
      <View style={[styles.signalCircle, { borderColor: stateColor }]}>
        <Text style={[styles.signalIcon, { color: stateColor }]}>
          {getStateIcon()}
        </Text>
        {positionLabel && (
          <Text style={[styles.positionText, { color: stateColor }]}>
            {positionLabel}
          </Text>
        )}
      </View>

      {/* State name */}
      <Text style={[
        styles.stateText,
        { color: stateColor },
        adjustments.extraLargeText && styles.extraLargeText,
      ]}>
        {state.toUpperCase()}
      </Text>

      {/* Spoken message */}
      <Text style={styles.messageText}>
        {message || 'Scanning...'}
      </Text>

      {/* Confidence indicator */}
      {confidence > 0 && (
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${confidence * 100}%`, backgroundColor: stateColor }
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>
            {Math.round(confidence * 100)}% confident
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacingLarge,
  },
  positionIndicator: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: SIZES.spacingMedium,
    backgroundColor: COLORS.backgroundSecondary,
    padding: 8,
    borderRadius: 8,
  },
  positionLight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  positionActive: {
    backgroundColor: COLORS.textPrimary,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  signalCircle: {
    width: width * 0.5,
    height: width * 0.5,
    maxWidth: 200,
    maxHeight: 200,
    borderRadius: 999,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  signalIcon: {
    fontSize: 80,
  },
  positionText: {
    fontSize: SIZES.textSmall,
    fontWeight: 'bold',
    marginTop: 8,
  },
  stateText: {
    fontSize: SIZES.textXL,
    fontWeight: 'bold',
    marginTop: SIZES.spacingMedium,
    letterSpacing: 4,
  },
  extraLargeText: {
    fontSize: SIZES.textXL + 12,
  },
  messageText: {
    fontSize: SIZES.textMedium,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingSmall,
    textAlign: 'center',
  },
  confidenceContainer: {
    marginTop: SIZES.spacingLarge,
    alignItems: 'center',
    width: '80%',
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
