import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Theme } from '@/constants/theme';
import { getDb } from '@/lib/database';

export default function SettingsScreen() {
  const [defaultUnit, setDefaultUnit] = useState<'lbs' | 'kg'>('lbs');

  const loadPreferences = useCallback(() => {
    const db = getDb();
    const prefs = db.getFirstSync<{ default_unit: string }>(
      'SELECT default_unit FROM user_preferences WHERE id = 1'
    );
    if (prefs) {
      setDefaultUnit(prefs.default_unit as 'lbs' | 'kg');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [loadPreferences])
  );

  const toggleUnit = (unit: 'lbs' | 'kg') => {
    setDefaultUnit(unit);
    const db = getDb();
    db.runSync('UPDATE user_preferences SET default_unit = ? WHERE id = 1', [unit]);
  };

  const handleExport = async () => {
    try {
      const db = getDb();
      const workouts = db.getAllSync('SELECT * FROM workouts');
      const exercises = db.getAllSync('SELECT * FROM exercise_entries');
      const sets = db.getAllSync('SELECT * FROM set_entries');

      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        workouts,
        exercises,
        sets,
      };

      const json = JSON.stringify(exportData, null, 2);
      const fileUri = FileSystem.documentDirectory + 'liftlog-export.json';
      await FileSystem.writeAsStringAsync(fileUri, json);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Complete', 'Data exported to app documents.');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export your data.');
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Import Data',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.largeTitle}>Settings</Text>
      </View>

      {/* Units Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>UNITS</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Default Unit</Text>
            <View style={styles.toggle}>
              <Pressable
                style={[
                  styles.toggleButton,
                  styles.toggleLeft,
                  defaultUnit === 'lbs' && styles.toggleActive,
                ]}
                onPress={() => toggleUnit('lbs')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    defaultUnit === 'lbs' && styles.toggleTextActive,
                  ]}
                >
                  LBS
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleButton,
                  styles.toggleRight,
                  defaultUnit === 'kg' && styles.toggleActive,
                ]}
                onPress={() => toggleUnit('kg')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    defaultUnit === 'kg' && styles.toggleTextActive,
                  ]}
                >
                  KG
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>DATA</Text>
        <View style={styles.group}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleExport}
          >
            <Text style={styles.rowLabel}>Export Data</Text>
            <Text style={styles.rowChevron}>{'\u203A'}</Text>
          </Pressable>
          <View style={styles.rowSeparator} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleImport}
          >
            <Text style={styles.rowLabel}>Import Data</Text>
            <Text style={styles.rowChevron}>{'\u203A'}</Text>
          </Pressable>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.group}>
          <View style={styles.aboutRow}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>L</Text>
            </View>
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutName}>LiftLog</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>Made for lifters, by lifters.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Theme.background,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Theme.text,
    letterSpacing: 0.37,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.muted,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  group: {
    backgroundColor: Theme.card,
    borderRadius: 13,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  rowPressed: {
    backgroundColor: Theme.elevated,
  },
  rowLabel: {
    fontSize: 16,
    color: Theme.text,
  },
  rowChevron: {
    fontSize: 22,
    color: Theme.muted,
    fontWeight: '300',
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Theme.divider,
    marginLeft: 16,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Theme.elevated,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  toggleLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  toggleRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  toggleActive: {
    backgroundColor: Theme.accent,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.muted,
  },
  toggleTextActive: {
    color: '#000000',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appIconText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
  },
  aboutInfo: {
    flex: 1,
  },
  aboutName: {
    fontSize: 17,
    fontWeight: '600',
    color: Theme.text,
    marginBottom: 2,
  },
  aboutVersion: {
    fontSize: 14,
    color: Theme.muted,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: Theme.muted,
    marginTop: 8,
    marginBottom: 32,
  },
});
