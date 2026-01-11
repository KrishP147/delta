/**
 * Tab Navigation Layout
 *
 * Main tab bar with two tabs:
 * - Profile: Color blindness settings and tests
 * - Dashcam: Live camera detection view
 */

import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/accessibility";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="profile" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: "Profile and color vision settings",
        }}
      />
      <Tabs.Screen
        name="dashcam"
        options={{
          title: "Dashcam",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="camera" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: "Live dashcam detection view",
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  icon,
  color,
  size,
}: {
  icon: "profile" | "camera";
  color: string;
  size: number;
}) {
  // Simple text-based icons for accessibility
  const icons = {
    profile: "P",
    camera: "C",
  };

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size + 8, height: size + 8, borderColor: color },
      ]}
    >
      <Text style={[styles.iconText, { color, fontSize: size - 4 }]}>
        {icons[icon]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  iconContainer: {
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontWeight: "bold",
  },
});
