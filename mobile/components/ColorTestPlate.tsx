/**
 * ColorTestPlate Component
 *
 * Renders colored circles for the color vision test.
 * Simple, clear presentation - just shows the actual colors
 * so the user can identify what they see.
 */

import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TestQuestion } from "../constants/ishihara";
import { COLORS } from "../constants/accessibility";

interface Props {
  question: TestQuestion;
}

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = Math.min(width * 0.25, 100);

export function ColorTestPlate({ question }: Props) {
  const { colors } = question;

  return (
    <View style={styles.container}>
      <View style={styles.circleRow}>
        {colors.map((color, index) => (
          <View
            key={index}
            style={[
              styles.circle,
              {
                backgroundColor: color,
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
              },
            ]}
            accessibilityLabel={`Color circle ${index + 1}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginVertical: 16,
  },
  circleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    backgroundColor: COLORS.backgroundSecondary,
    padding: 32,
    borderRadius: 20,
  },
  circle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
