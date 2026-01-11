/**
 * Dashcam Tab Layout
 *
 * Simple stack for the dashcam screen.
 * Configures landscape orientation when active.
 */

import { Stack } from "expo-router";
import { COLORS } from "../../../constants/accessibility";

export default function DashcamLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Dashcam",
        }}
      />
    </Stack>
  );
}
