/**
 * Root Layout
 *
 * Sets up the navigation structure with:
 * - Onboarding flow for first-time users
 * - Tab navigation for main app
 * - Global styles and dark theme
 * - Android navigation bar handling
 */

import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, ActivityIndicator, Text, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { COLORS } from "../constants/accessibility";
import { useAppStore } from "../store/useAppStore";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const { hasCompletedOnboarding } = useAppStore();

  useEffect(() => {
    // Configure Android navigation bar
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(COLORS.background);
      NavigationBar.setButtonStyleAsync("light");
      // Hide navigation bar for immersive mode
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }

    // Small delay to ensure store is hydrated from AsyncStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text style={styles.loadingText}>Loading Delta...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={false} />
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
        {/* Onboarding screens for first-time users */}
        <Stack.Screen
          name="index"
          options={{
            title: "Delta",
            headerShown: false,
          }}
        />

        {/* Main app with tab navigation */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
});
