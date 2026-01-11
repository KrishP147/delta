/**
 * Bounding Box Overlay Component - TARGET LOCK STYLE
 *
 * Draws brackets around detected objects like a targeting system.
 * - ADAPTIVE COLORS based on user's colorblindness type
 * - Flashing animation for objects with problematic colors
 * - Smooth animations for tracking moving objects
 * - Autolock follows objects as they move in frame
 * 
 * COLOR ADAPTATION:
 * - Protanopia (red-blind): Uses cyan (#00CED1) for alerts instead of red
 * - Deuteranopia (green-blind): Uses pink (#FF69B4) for alerts
 * - Tritanopia (blue-blind): Uses orange-red (#FF4500) for alerts
 * - Normal vision: Uses standard red/green colors
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { DetectedObject } from '../services/api';
import { TrackedObject } from '../services/motionTracking';
import { ColorblindnessType, getAdaptiveColors } from '../constants/accessibility';

interface Props {
  objects: (DetectedObject | TrackedObject)[];
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  activeTargetIndex?: number; // Index of currently locked-on target
  colorblindType?: ColorblindnessType; // User's colorblindness for adaptive colors
  transportMode?: 'walking' | 'biking' | 'driving' | 'passenger'; // Current transport mode for context
  showOnlyProblematic?: boolean; // If true, only show objects with problematic colors (default: true)
  maxDisplayObjects?: number; // Maximum objects to display at once (prevents clutter)
}

// Adaptive color palettes based on colorblindness type
// KEY PRINCIPLE: Never use a color that the user cannot see for alerts!
const ADAPTIVE_PALETTES: Record<ColorblindnessType, {
  bracket: string;
  alert: string;
  active: string;
  warning: string;
}> = {
  // Normal vision - standard traffic colors
  normal: {
    bracket: '#FF6B35',      // Orange - normal brackets
    alert: '#FF3366',        // Red-pink - danger/alert
    active: '#00FF88',       // Green - active target
    warning: '#FFD700',      // Yellow - warning
  },
  // Protanopia (can't see red) - Use CYAN for alerts instead of red
  protanopia: {
    bracket: '#FF6B35',      // Orange brackets (still visible)
    alert: '#00CED1',        // CYAN - replaces red (highly visible)
    active: '#FFFF00',       // Yellow - replaces green for active
    warning: '#00BFFF',      // Deep sky blue for warnings
  },
  protanomaly: {
    bracket: '#FF6B35',
    alert: '#00CED1',        // Cyan for alerts
    active: '#FFFF00',       // Yellow for active
    warning: '#00BFFF',
  },
  // Deuteranopia (can't see green) - Use PINK for alerts
  deuteranopia: {
    bracket: '#FF6B35',      // Orange brackets
    alert: '#FF69B4',        // HOT PINK - highly visible for alerts
    active: '#00FFFF',       // Cyan - replaces green for active
    warning: '#FF8C00',      // Dark orange for warnings
  },
  deuteranomaly: {
    bracket: '#FF6B35',
    alert: '#FF69B4',        // Pink for alerts
    active: '#00FFFF',       // Cyan for active
    warning: '#FF8C00',
  },
  // Tritanopia (can't see blue) - Use ORANGE-RED for alerts
  tritanopia: {
    bracket: '#00FF00',      // Green brackets (no blue!)
    alert: '#FF4500',        // ORANGE-RED for alerts
    active: '#FF00FF',       // Magenta for active
    warning: '#FF6347',      // Tomato red for warnings
  },
  // Low vision - extra high contrast
  low_vision: {
    bracket: '#FFFFFF',      // White brackets for visibility
    alert: '#FFFF00',        // Bright yellow for alerts
    active: '#00FF00',       // Bright green for active
    warning: '#FF8800',      // Orange for warnings
  },
  unknown: {
    bracket: '#FF6B35',
    alert: '#00CED1',        // Default to cyan (safe for most)
    active: '#FFFF00',
    warning: '#00BFFF',
  },
};

// Get colors based on colorblindness type
function getTargetingColors(colorblindType: ColorblindnessType = 'normal') {
  return ADAPTIVE_PALETTES[colorblindType] || ADAPTIVE_PALETTES.unknown;
}

// Animated bracket component for each detected object
function TargetBracket({
  targetObj,
  left,
  top,
  boxWidth,
  boxHeight,
  isActiveTarget = false,
  colors, // Adaptive colors based on user's colorblindness
  transportMode,
}: {
  key?: string;
  targetObj: DetectedObject | TrackedObject;
  left: number;
  top: number;
  boxWidth: number;
  boxHeight: number;
  isActiveTarget?: boolean;
  colors: { bracket: string; alert: string; active: string; warning: string };
  transportMode?: 'walking' | 'biking' | 'driving' | 'passenger';
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;
  // Use separate animated values for X and Y to avoid 'top' style warning
  const positionX = useRef(new Animated.Value(left)).current;
  const positionY = useRef(new Animated.Value(top)).current;
  const lockOnAnim = useRef(new Animated.Value(isActiveTarget ? 1 : 0)).current;
  
  const isTracked = 'isMoving' in targetObj;
  const isMoving = isTracked && (targetObj as TrackedObject).isMoving;
  const isAlert = targetObj.isProblematicColor;
  
  // Priority: Alert > Active > Normal
  // Uses ADAPTIVE colors that change based on user's colorblindness!
  const bracketColor = isAlert ? colors.alert : (isActiveTarget ? colors.active : colors.bracket);

  // Smooth position animation for autolock tracking
  useEffect(() => {
    Animated.parallel([
      Animated.timing(positionX, {
        toValue: left,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(positionY, {
        toValue: top,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [left, top]);

  // Lock-on animation when target becomes active
  useEffect(() => {
    Animated.timing(lockOnAnim, {
      toValue: isActiveTarget ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActiveTarget]);

  useEffect(() => {
    // More pronounced pulse for active target
    const pulseScale = isActiveTarget ? 1.06 : 1.03;
    const pulseDuration = isActiveTarget ? 300 : 400;
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: pulseScale,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim, isActiveTarget]);

  // FLASHING animation for problematic colors - rapid flash
  useEffect(() => {
    if (isAlert) {
      const flashAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      );
      flashAnimation.start();
      return () => flashAnimation.stop();
    } else {
      flashAnim.setValue(1);
    }
  }, [isAlert, flashAnim]);

  // Get label for display - ALWAYS show color prominently with transport mode context
  const getLabel = () => {
    const prefix = isActiveTarget ? '◉ ' : (isMoving ? '→ ' : '');
    const objName = targetObj.label || targetObj.class || 'Object';
    
    // Add transport mode context for critical objects
    let modeContext = '';
    if (transportMode === 'driving' && (objName.includes('light') || objName.includes('sign') || objName.includes('car'))) {
      modeContext = ' [🚗]'; // Driving context
    } else if (transportMode === 'biking' && (objName.includes('car') || objName.includes('person') || objName.includes('bike'))) {
      modeContext = ' [🚴]'; // Biking context
    } else if (transportMode === 'walking' && (objName.includes('car') || objName.includes('crosswalk') || objName.includes('person'))) {
      modeContext = ' [🚶]'; // Walking context
    }
    
    // Always show colors if available
    const colors = targetObj.colors;
    if (colors && colors.length > 0) {
      const colorStr = colors.slice(0, 2).join('/').toUpperCase();
      // Show color warning if problematic
      if (isAlert && targetObj.colorWarning) {
        return `⚠ ${colorStr} - ${objName}${modeContext}`;
      }
      return `${prefix}${colorStr} - ${objName}${modeContext}`;
    }
    
    // Fallback to just label
    if (isAlert && targetObj.colorWarning) {
      return `⚠ ${targetObj.colorWarning}${modeContext}`;
    }
    return prefix + objName + modeContext;
  };

  const cornerSize = Math.min(boxWidth, boxHeight) * 0.2;
  const minCornerSize = 16;
  const maxCornerSize = 40;
  const actualCornerSize = Math.max(minCornerSize, Math.min(maxCornerSize, cornerSize));
  const thickness = isActiveTarget ? 4 : (isAlert ? 4 : 3);

  return (
    <Animated.View
      style={[
        styles.targetContainer,
        {
          width: boxWidth,
          height: boxHeight,
          transform: [
            { translateX: positionX },
            { translateY: positionY },
            { scale: pulseAnim },
          ],
          opacity: isAlert ? flashAnim : 1,
        },
      ]}
    >
      {/* Top-left bracket */}
      <View style={[styles.corner, styles.cornerTL, { 
        borderColor: bracketColor,
        borderTopWidth: thickness,
        borderLeftWidth: thickness,
        width: actualCornerSize,
        height: actualCornerSize,
      }]} />
      
      {/* Top-right bracket */}
      <View style={[styles.corner, styles.cornerTR, { 
        borderColor: bracketColor,
        borderTopWidth: thickness,
        borderRightWidth: thickness,
        width: actualCornerSize,
        height: actualCornerSize,
      }]} />
      
      {/* Bottom-left bracket */}
      <View style={[styles.corner, styles.cornerBL, { 
        borderColor: bracketColor,
        borderBottomWidth: thickness,
        borderLeftWidth: thickness,
        width: actualCornerSize,
        height: actualCornerSize,
      }]} />
      
      {/* Bottom-right bracket */}
      <View style={[styles.corner, styles.cornerBR, { 
        borderColor: bracketColor,
        borderBottomWidth: thickness,
        borderRightWidth: thickness,
        width: actualCornerSize,
        height: actualCornerSize,
      }]} />

      {/* Center crosshair for active target or alert objects */}
      {(isActiveTarget || isAlert) && (
        <Animated.View style={[styles.crosshair, { opacity: isAlert ? flashAnim : lockOnAnim }]}>
          <View style={[styles.crosshairLine, styles.crosshairH, { backgroundColor: bracketColor }]} />
          <View style={[styles.crosshairLine, styles.crosshairV, { backgroundColor: bracketColor }]} />
          <View style={[styles.crosshairCenter, { backgroundColor: bracketColor }]} />
        </Animated.View>
      )}

      {/* Label at bottom */}
      <View style={[
        styles.labelContainer, 
        { borderColor: bracketColor },
        (isAlert || isActiveTarget) && styles.labelContainerActive
      ]}>
        <Text style={[styles.labelText, { color: bracketColor }]} numberOfLines={1}>
          {getLabel()}
        </Text>
        <Text style={styles.confidenceText}>
          {Math.round(targetObj.confidence * 100)}%
        </Text>
      </View>

      {/* FLASHING Alert indicator for problematic colors */}
      {isAlert && (
        <Animated.View style={[styles.alertBadge, { opacity: flashAnim }]}>
          <Text style={styles.alertText}>⚠</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

export function BoundingBoxOverlay({
  objects,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  activeTargetIndex = 0,
  colorblindType = 'normal',
  transportMode = 'driving',
  showOnlyProblematic = true, // Default: only show problematic colors
  maxDisplayObjects = 5, // Default: max 5 objects to prevent clutter
}: Props) {
  // Get adaptive colors based on user's colorblindness
  const colors = useMemo(() => getTargetingColors(colorblindType), [colorblindType]);

  // Filter objects based on user's color deficiency
  // For low_vision: show more objects based on urgency/proximity
  // For color deficiencies: only show objects with problematic colors
  const filteredObjects = useMemo(() => {
    if (!objects || objects.length === 0) return [];

    let result: (DetectedObject | TrackedObject)[];

    if (colorblindType === 'low_vision') {
      // Low vision: prioritize by urgency (alert priority) and size (proxy for closeness)
      result = [...objects].sort((a, b) => {
        // Critical/high priority first
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
        const aPriority = priorityOrder[a.alertPriority] ?? 4;
        const bPriority = priorityOrder[b.alertPriority] ?? 4;
        if (aPriority !== bPriority) return aPriority - bPriority;

        // Then by size (larger = closer = more urgent)
        const aSize = a.bbox.width * a.bbox.height;
        const bSize = b.bbox.width * b.bbox.height;
        return bSize - aSize;
      });
    } else if (showOnlyProblematic) {
      // Color deficiencies: only show objects with problematic colors
      result = objects.filter(obj => obj.isProblematicColor);
    } else {
      result = objects;
    }

    // Limit to max display objects
    return result.slice(0, maxDisplayObjects);
  }, [objects, colorblindType, showOnlyProblematic, maxDisplayObjects]);

  console.log(`[BoundingBoxOverlay] Showing ${filteredObjects.length}/${objects?.length || 0} objects (colorblindType: ${colorblindType}, showOnlyProblematic: ${showOnlyProblematic})`);

  // Get the active target for the color info box (from filtered objects)
  const activeTarget = filteredObjects.length > 0
    ? filteredObjects[Math.min(activeTargetIndex, filteredObjects.length - 1)]
    : null;

  if (filteredObjects.length === 0) return null;

  // Calculate scale factors
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      {filteredObjects.map((obj, index) => {
        // Scale coordinates to container dimensions
        const left = obj.bbox.x * scaleX;
        const top = obj.bbox.y * scaleY;
        const width = obj.bbox.width * scaleX;
        const height = obj.bbox.height * scaleY;

        // Skip very small detections
        if (width < 20 || height < 20) return null;

        // Is this the currently locked-on target?
        const isActiveTarget = index === activeTargetIndex;

        return (
          <TargetBracket
            key={obj.id}
            targetObj={obj}
            left={left}
            top={top}
            boxWidth={width}
            boxHeight={height}
            isActiveTarget={isActiveTarget}
            colors={colors}
            transportMode={transportMode}
          />
        );
      })}
      
      {/* Object count indicator - shows filtered/total */}
      <View style={[styles.countBadge, { borderColor: colors.bracket }]}>
        <Text style={[styles.countText, { color: colors.bracket }]}>
          {filteredObjects.length} alert{filteredObjects.length !== 1 ? 's' : ''}
          {objects && objects.length > filteredObjects.length ? ` (${objects.length} total)` : ''}
        </Text>
      </View>
      
      {/* LIVE COLOR INFO BOX - Shows active target's color info */}
      {activeTarget && (
        <View style={[styles.colorInfoBox, { borderColor: activeTarget.isProblematicColor ? colors.alert : colors.active }]}>
          <View style={styles.colorInfoHeader}>
            <Text style={[styles.colorInfoTitle, { color: activeTarget.isProblematicColor ? colors.alert : colors.active }]}>
              {activeTarget.isProblematicColor ? '⚠ COLOR ALERT' : '◉ TRACKING'}
            </Text>
          </View>
          <Text style={styles.colorInfoLabel}>
            {activeTarget.label || activeTarget.class || 'Object'}
          </Text>
          <View style={styles.colorInfoRow}>
            <Text style={styles.colorInfoKey}>Colors: </Text>
            <Text style={[
              styles.colorInfoValue,
              activeTarget.isProblematicColor && { color: colors.alert, fontWeight: '700' }
            ]}>
              {activeTarget.colors && activeTarget.colors.length > 0 
                ? activeTarget.colors.join(', ').toUpperCase()
                : 'analyzing...'}
            </Text>
          </View>
          {activeTarget.colorWarning && (
            <Text style={[styles.colorInfoWarning, { color: colors.alert }]}>
              ⚠ {activeTarget.colorWarning}
            </Text>
          )}
          <Text style={styles.colorInfoConfidence}>
            Confidence: {Math.round(activeTarget.confidence * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  targetContainer: {
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
  },
  cornerTL: {
    top: 0,
    left: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairLine: {
    position: 'absolute',
  },
  crosshairH: {
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    marginTop: -1,
  },
  crosshairV: {
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
  },
  crosshairCenter: {
    width: 6,
    height: 6,
  },
  labelContainer: {
    position: 'absolute',
    bottom: -28,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  labelContainerAlert: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  labelContainerActive: {
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  labelTextAlert: {
    color: '#FF3366',
  },
  confidenceText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  alertBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  alertText: {
    color: '#fff',
    fontSize: 14,
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    // borderColor set dynamically
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    // color set dynamically
  },
  // Color Info Box - shows active target's color information
  colorInfoBox: {
    position: 'absolute',
    bottom: 80,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    minWidth: 180,
    maxWidth: 220,
  },
  colorInfoHeader: {
    marginBottom: 6,
  },
  colorInfoTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  colorInfoLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  colorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorInfoKey: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  colorInfoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  colorInfoWarning: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  colorInfoConfidence: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 6,
  },
});
