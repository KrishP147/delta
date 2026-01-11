/**
 * Settings Screen
 *
 * Allows users to customize TrueLight behavior including:
 * - Audio settings
 * - Warning sensitivity
 * - Transit mode preferences
 * - Colorblindness test retake
 * - Statistics and about info
 *
 * ACCESSIBILITY:
 * - Large touch targets
 * - High contrast
 * - Clear labels
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, ColorblindnessType } from '../constants/accessibility';
import {
  getColorblindType,
  getSettings,
  updateSettings,
  resetStorage,
  AppSettings,
} from '../services/storage';
import { audioAlertService } from '../services/AudioAlertService';
import { speak } from '../services/speech';
import { logout } from '../services/auth';

type SensitivityLevel = 'conservative' | 'normal' | 'aggressive';

export default function SettingsScreen() {
  const router = useRouter();
  const [colorblindType, setColorblindType] = useState<ColorblindnessType>('unknown');
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  useEffect(() => {
    setColorblindType(getColorblindType());
    speak('Settings');
  }, []);

  const handleToggleAudio = (value: boolean) => {
    const newSettings = { ...settings, audioEnabled: value };
    setSettings(newSettings);
    updateSettings(newSettings);
    audioAlertService.setEnabled(value);
    speak(value ? 'Audio enabled' : 'Audio disabled');
  };

  const handleToggleSpeed = (value: boolean) => {
    const newSettings = { ...settings, speedTrackingEnabled: value };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleSensitivityChange = (level: SensitivityLevel) => {
    const newSettings = { ...settings, warningSensitivity: level };
    setSettings(newSettings);
    updateSettings(newSettings);
    
    // Adjust cooldowns based on sensitivity
    const cooldowns = {
      conservative: { critical: 5000, high: 8000, medium: 12000, low: 15000 },
      normal: { critical: 3000, high: 5000, medium: 8000, low: 10000 },
      aggressive: { critical: 2000, high: 3000, medium: 5000, low: 7000 },
    };
    audioAlertService.setCooldowns(cooldowns[level]);
    speak(`Sensitivity set to ${level}`);
  };

  const handleRetakeTest = () => {
    Alert.alert(
      'Retake Vision Test',
      'This will reset your colorblindness calibration. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake',
          onPress: () => {
            speak('Starting vision test');
            router.push('/test');
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will clear all settings and data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetStorage();
            speak('App reset. Returning to start.');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            speak('Logging out');
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getVisionTypeLabel = (type: ColorblindnessType): string => {
    const labels: Record<ColorblindnessType, string> = {
      normal: 'Normal Vision',
      protanopia: 'Protanopia (Red-blind)',
      deuteranopia: 'Deuteranopia (Green-blind)',
      tritanopia: 'Tritanopia (Blue-blind)',
      protanomaly: 'Protanomaly (Red-weak)',
      deuteranomaly: 'Deuteranomaly (Green-weak)',
      low_vision: 'Low Vision Mode',
      unknown: 'Not Set',
    };
    return labels[type] || 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vision Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vision Profile</Text>
          <View style={styles.profileCard}>
            <Text style={styles.profileLabel}>Current Setting</Text>
            <Text style={styles.profileValue}>{getVisionTypeLabel(colorblindType)}</Text>
          </View>
          <Pressable
            style={styles.button}
            onPress={handleRetakeTest}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Retake Vision Test</Text>
          </Pressable>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Audio Alerts</Text>
              <Text style={styles.settingDescription}>
                Speak hazard warnings aloud
              </Text>
            </View>
            <Switch
              value={settings.audioEnabled}
              onValueChange={handleToggleAudio}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.textPrimary}
            />
          </View>
        </View>

        {/* Speed Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speed Tracking</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>GPS Speed Detection</Text>
              <Text style={styles.settingDescription}>
                Adjust warnings based on movement speed
              </Text>
            </View>
            <Switch
              value={settings.speedTrackingEnabled}
              onValueChange={handleToggleSpeed}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.textPrimary}
            />
          </View>
        </View>

        {/* Warning Sensitivity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warning Sensitivity</Text>
          <Text style={styles.sectionDescription}>
            How frequently warnings are announced
          </Text>
          
          <View style={styles.sensitivityOptions}>
            {(['conservative', 'normal', 'aggressive'] as SensitivityLevel[]).map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.sensitivityButton,
                  settings.warningSensitivity === level && styles.sensitivityButtonActive,
                ]}
                onPress={() => handleSensitivityChange(level)}
                accessibilityRole="button"
                accessibilityState={{ selected: settings.warningSensitivity === level }}
              >
                <Text
                  style={[
                    styles.sensitivityText,
                    settings.warningSensitivity === level && styles.sensitivityTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <Text style={styles.sensitivityHint}>
            {settings.warningSensitivity === 'conservative' && 'Fewer alerts, longer cooldowns'}
            {settings.warningSensitivity === 'normal' && 'Balanced alert frequency'}
            {settings.warningSensitivity === 'aggressive' && 'More frequent alerts'}
          </Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>TrueLight</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              AI-powered hazard detection system for colorblind users.
              Uses camera and audio to provide real-time warnings about
              traffic signals, signs, and other color-based hazards.
            </Text>
          </View>

          <Pressable
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetApp}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Reset All Settings</Text>
          </Pressable>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.spacingLarge,
  },
  section: {
    marginBottom: SIZES.spacingLarge * 1.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingSmall,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionDescription: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingMedium,
  },
  profileCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileLabel: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: SIZES.textMedium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: SIZES.spacingMedium,
  },
  settingLabel: {
    fontSize: SIZES.textSmall + 2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: SIZES.textSmall - 2,
    color: COLORS.textSecondary,
  },
  sensitivityOptions: {
    flexDirection: 'row',
    gap: SIZES.spacingSmall,
    marginBottom: SIZES.spacingSmall,
  },
  sensitivityButton: {
    flex: 1,
    paddingVertical: SIZES.spacingMedium,
    paddingHorizontal: SIZES.spacingSmall,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  sensitivityButtonActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  sensitivityText: {
    fontSize: SIZES.textSmall,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sensitivityTextActive: {
    color: COLORS.accent,
  },
  sensitivityHint: {
    fontSize: SIZES.textSmall - 2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SIZES.buttonPadding,
    paddingHorizontal: SIZES.spacingLarge,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dangerButton: {
    borderColor: COLORS.red,
  },
  logoutButton: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.textSmall + 2,
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutTitle: {
    fontSize: SIZES.textMedium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacingSmall,
  },
  aboutDescription: {
    fontSize: SIZES.textSmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
