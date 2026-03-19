import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Theme } from '@/constants/theme';
import { getDb } from '@/lib/database';
import type { Workout } from '@/lib/models';

interface WorkoutRow extends Workout {
  exercise_count: number;
  set_count: number;
  exercise_names: string | null;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);

  const loadWorkouts = useCallback(() => {
    const db = getDb();
    const rows = db.getAllSync<WorkoutRow>(
      `SELECT w.*,
        (SELECT COUNT(*) FROM exercise_entries WHERE workout_id = w.id) as exercise_count,
        (SELECT COUNT(*) FROM set_entries se
          JOIN exercise_entries ee ON se.exercise_entry_id = ee.id
          WHERE ee.workout_id = w.id) as set_count,
        (SELECT GROUP_CONCAT(name, ', ')
          FROM (SELECT name FROM exercise_entries WHERE workout_id = w.id ORDER BY sort_order LIMIT 3)
        ) as exercise_names
      FROM workouts w
      ORDER BY w.created_at DESC`
    );
    setWorkouts(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const createWorkout = () => {
    const db = getDb();
    const now = Date.now();
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const result = db.runSync(
      'INSERT INTO workouts (date, title, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [dateStr, 'New Workout', '', now, now]
    );
    router.push(`/workout/${result.lastInsertRowId}`);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderWorkout = ({ item }: ListRenderItemInfo<WorkoutRow>) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/workout/${item.id}`)}
    >
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        {item.exercise_count > 0 && (
          <Text style={styles.cardStats}>
            {item.exercise_count} exercise{item.exercise_count !== 1 ? 's' : ''}
            {' \u00B7 '}
            {item.set_count} set{item.set_count !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      {item.exercise_names ? (
        <Text style={styles.cardExercises} numberOfLines={1}>
          {item.exercise_names}
        </Text>
      ) : (
        <Text style={styles.cardEmpty}>No exercises yet</Text>
      )}
    </Pressable>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{'  '}</Text>
      <Text style={styles.emptyTitle}>No Workouts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to start your first workout
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.largeTitle}>Workouts</Text>
      </View>
      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={createWorkout}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
    backgroundColor: Theme.background,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Theme.text,
    letterSpacing: 0.37,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Theme.card,
    borderRadius: 13,
    padding: 16,
    marginBottom: 8,
  },
  cardPressed: {
    backgroundColor: Theme.elevated,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Theme.text,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 13,
    color: Theme.muted,
  },
  cardStats: {
    fontSize: 13,
    color: Theme.muted,
    marginLeft: 8,
  },
  cardExercises: {
    fontSize: 14,
    color: Theme.secondaryText,
  },
  cardEmpty: {
    fontSize: 14,
    color: Theme.muted,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Theme.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  fabIcon: {
    fontSize: 32,
    fontWeight: '300',
    color: '#000000',
    marginTop: -2,
  },
});
