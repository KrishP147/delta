/**
 * ColorTestPlate Component
 *
 * Renders a simplified Ishihara-style color test plate.
 * Uses colored circles to display a number that may be
 * visible or hidden depending on the user's color vision.
 */

import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TestPlate } from "../constants/ishihara";
import { COLORS } from "../constants/accessibility";

interface Props {
  plate: TestPlate;
}

const { width } = Dimensions.get("window");
const PLATE_SIZE = Math.min(width - 48, 320);

export function ColorTestPlate({ plate }: Props) {
  // Generate circles once per plate
  const circles = useMemo(() => generateCirclePattern(plate), [plate.id]);

  return (
    <View style={styles.container}>
      <View style={[styles.plate, { width: PLATE_SIZE, height: PLATE_SIZE }]}>
        {circles.map((circle, index) => (
          <View
            key={index}
            style={[
              styles.circle,
              {
                backgroundColor: circle.color,
                width: circle.size,
                height: circle.size,
                left: circle.x,
                top: circle.y,
                borderRadius: circle.size / 2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

interface Circle {
  x: number;
  y: number;
  size: number;
  color: string;
}

/**
 * Attempt to place a circle without overlapping existing circles
 */
function tryPlaceCircle(
  existingCircles: Circle[],
  centerX: number,
  centerY: number,
  plateRadius: number,
  minSize: number,
  maxSize: number,
): Circle | null {
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * (plateRadius - 15);
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    const size = minSize + Math.random() * (maxSize - minSize);

    // Check if within plate bounds
    const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (distFromCenter + size / 2 > plateRadius - 5) continue;

    // Check for overlap with existing circles
    let overlaps = false;
    for (const existing of existingCircles) {
      const dist = Math.sqrt(
        (x - existing.x - existing.size / 2) ** 2 +
          (y - existing.y - existing.size / 2) ** 2,
      );
      const minDist = (size + existing.size) / 2 + 2; // 2px gap
      if (dist < minDist) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      return { x: x - size / 2, y: y - size / 2, size, color: "" };
    }
  }

  return null;
}

/**
 * Generates a pattern of circles that form a number
 * The number is visible to those who can distinguish the colors
 */
function generateCirclePattern(plate: TestPlate): Circle[] {
  const circles: Circle[] = [];
  const centerX = PLATE_SIZE / 2;
  const centerY = PLATE_SIZE / 2;
  const radius = PLATE_SIZE / 2 - 8;

  // Get the number pattern function
  const numberPattern = getNumberPattern(plate.normalAnswer);

  // Place circles with collision detection
  const targetCircles = 180;
  let attempts = 0;
  const maxTotalAttempts = targetCircles * 30;

  while (circles.length < targetCircles && attempts < maxTotalAttempts) {
    attempts++;

    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;

    // Vary circle sizes
    const size = 14 + Math.random() * 14;

    // Check if within plate bounds
    const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (distFromCenter + size / 2 > radius) continue;

    // Check for overlap with existing circles
    let overlaps = false;
    for (const existing of circles) {
      const ex = existing.x + existing.size / 2;
      const ey = existing.y + existing.size / 2;
      const dist = Math.sqrt((x - ex) ** 2 + (y - ey) ** 2);
      const minDist = (size + existing.size) / 2 + 3;
      if (dist < minDist) {
        overlaps = true;
        break;
      }
    }

    if (overlaps) continue;

    // Check if this position is part of the number
    const normalizedX = (x - centerX + radius) / (radius * 2);
    const normalizedY = (y - centerY + radius) / (radius * 2);
    const isPartOfNumber = numberPattern(normalizedX, normalizedY);

    circles.push({
      x: x - size / 2,
      y: y - size / 2,
      size,
      color: isPartOfNumber ? plate.foregroundColor : plate.backgroundColor,
    });
  }

  return circles;
}

/**
 * Returns a function that determines if a point is part of the number
 * x and y are normalized 0-1, with (0.5, 0.5) being the center
 */
function getNumberPattern(answer: string): (x: number, y: number) => boolean {
  const patterns: Record<string, (x: number, y: number) => boolean> = {
    "12": (x, y) => {
      // "1" on left
      const in1 = x > 0.22 && x < 0.38 && y > 0.25 && y < 0.75;
      // "2" on right - top bar, right side down, middle bar, left side down, bottom bar
      const in2Top = x > 0.52 && x < 0.78 && y > 0.25 && y < 0.35;
      const in2Right = x > 0.68 && x < 0.78 && y > 0.25 && y < 0.5;
      const in2Mid = x > 0.52 && x < 0.78 && y > 0.45 && y < 0.55;
      const in2Left = x > 0.52 && x < 0.62 && y > 0.5 && y < 0.75;
      const in2Bot = x > 0.52 && x < 0.78 && y > 0.65 && y < 0.75;
      return in1 || in2Top || in2Right || in2Mid || in2Left || in2Bot;
    },

    "8": (x, y) => {
      // Two stacked circles forming an 8
      const cx = 0.5;
      const topY = 0.35;
      const botY = 0.65;
      const outerR = 0.18;
      const innerR = 0.08;

      const distTop = Math.sqrt((x - cx) ** 2 + (y - topY) ** 2);
      const distBot = Math.sqrt((x - cx) ** 2 + (y - botY) ** 2);

      const inTopRing = distTop > innerR && distTop < outerR;
      const inBotRing = distBot > innerR && distBot < outerR;

      return inTopRing || inBotRing;
    },

    "3": (x, y) => {
      // Three horizontal bars on the right side
      const top = y > 0.25 && y < 0.35 && x > 0.35 && x < 0.65;
      const mid = y > 0.45 && y < 0.55 && x > 0.35 && x < 0.65;
      const bot = y > 0.65 && y < 0.75 && x > 0.35 && x < 0.65;
      const right = x > 0.55 && x < 0.65 && y > 0.25 && y < 0.75;
      return top || mid || bot || right;
    },

    "5": (x, y) => {
      const top = y > 0.25 && y < 0.35 && x > 0.32 && x < 0.68;
      const leftTop = x > 0.32 && x < 0.42 && y > 0.25 && y < 0.5;
      const mid = y > 0.45 && y < 0.55 && x > 0.32 && x < 0.68;
      const rightBot = x > 0.58 && x < 0.68 && y > 0.5 && y < 0.75;
      const bot = y > 0.65 && y < 0.75 && x > 0.32 && x < 0.68;
      return top || leftTop || mid || rightBot || bot;
    },

    "2": (x, y) => {
      const top = y > 0.25 && y < 0.35 && x > 0.32 && x < 0.68;
      const rightTop = x > 0.58 && x < 0.68 && y > 0.25 && y < 0.5;
      const mid = y > 0.45 && y < 0.55 && x > 0.32 && x < 0.68;
      const leftBot = x > 0.32 && x < 0.42 && y > 0.5 && y < 0.75;
      const bot = y > 0.65 && y < 0.75 && x > 0.32 && x < 0.68;
      return top || rightTop || mid || leftBot || bot;
    },

    "29": (x, y) => {
      // "2" on left
      const in2Top = x > 0.15 && x < 0.42 && y > 0.28 && y < 0.38;
      const in2Right = x > 0.32 && x < 0.42 && y > 0.28 && y < 0.5;
      const in2Mid = x > 0.15 && x < 0.42 && y > 0.45 && y < 0.55;
      const in2Left = x > 0.15 && x < 0.25 && y > 0.5 && y < 0.72;
      const in2Bot = x > 0.15 && x < 0.42 && y > 0.62 && y < 0.72;

      // "9" on right - circle on top with tail going down
      const cx9 = 0.65;
      const cy9 = 0.4;
      const dist9 = Math.sqrt((x - cx9) ** 2 + (y - cy9) ** 2);
      const in9Circle = dist9 > 0.06 && dist9 < 0.14;
      const in9Tail = x > 0.72 && x < 0.82 && y > 0.35 && y < 0.72;

      return (
        in2Top ||
        in2Right ||
        in2Mid ||
        in2Left ||
        in2Bot ||
        in9Circle ||
        in9Tail
      );
    },

    "70": (x, y) => {
      // "7" on left
      const in7Top = x > 0.15 && x < 0.42 && y > 0.28 && y < 0.38;
      const in7Diag = x > 0.25 && x < 0.38 && y > 0.28 && y < 0.72;

      // "0" on right
      const cx0 = 0.65;
      const cy0 = 0.5;
      const dist0 = Math.sqrt((x - cx0) ** 2 + ((y - cy0) * 0.8) ** 2);
      const in0 = dist0 > 0.1 && dist0 < 0.2;

      return in7Top || in7Diag || in0;
    },

    "74": (x, y) => {
      // "7" on left
      const in7Top = x > 0.15 && x < 0.42 && y > 0.28 && y < 0.38;
      const in7Stem = x > 0.28 && x < 0.38 && y > 0.28 && y < 0.72;

      // "4" on right
      const in4Left = x > 0.55 && x < 0.65 && y > 0.28 && y < 0.55;
      const in4Mid = y > 0.5 && y < 0.58 && x > 0.55 && x < 0.82;
      const in4Right = x > 0.72 && x < 0.82 && y > 0.28 && y < 0.72;

      return in7Top || in7Stem || in4Left || in4Mid || in4Right;
    },

    "21": (x, y) => {
      // "2" on left
      const in2Top = x > 0.18 && x < 0.45 && y > 0.28 && y < 0.38;
      const in2Right = x > 0.35 && x < 0.45 && y > 0.28 && y < 0.5;
      const in2Mid = x > 0.18 && x < 0.45 && y > 0.45 && y < 0.55;
      const in2Left = x > 0.18 && x < 0.28 && y > 0.5 && y < 0.72;
      const in2Bot = x > 0.18 && x < 0.45 && y > 0.62 && y < 0.72;

      // "1" on right
      const in1 = x > 0.58 && x < 0.72 && y > 0.28 && y < 0.72;

      return in2Top || in2Right || in2Mid || in2Left || in2Bot || in1;
    },
  };

  return patterns[answer] || (() => false);
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  plate: {
    borderRadius: PLATE_SIZE / 2,
    backgroundColor: COLORS.backgroundSecondary,
    position: "relative",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
  },
});
