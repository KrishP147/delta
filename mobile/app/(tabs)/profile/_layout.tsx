/**
 * Profile Tab Layout
 *
 * Stack navigation for profile-related screens:
 * - Index: Profile overview with color vision results
 * - Test: Take/retake color vision test
 * - Settings: App settings and preferences
 */

import { Stack } from "expo-router";
import { COLORS } from "../../../constants/accessibility";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
        },
        contentStyle: {
          backgroundColor: COLORS.background,
        },
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
        }}
      />
      <Stack.Screen
        name="test"
        options={{
          title: "Vision Test",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
