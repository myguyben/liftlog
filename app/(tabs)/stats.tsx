import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Theme } from '@/constants/theme';
import { getDb } from '@/lib/database';
import type { UserExerciseStats } from '@/lib/models';

interface StatsData {
  totalWorkouts: number;
  dayStreak: number;
  totalExercises: number;
}

export default function StatsScreen() {
  const [stats, setStats] = useState<StatsData>({
    totalWorkouts: 0,
    dayStreak: 0,
    totalExercises: 0,
  });
  const [personalRecords, setPersonalRecords] = useState<UserExerciseStats[]>([]);

  const loadStats = useCallback(() => {
    const db = getDb();

    // Total workouts
    const workoutCount = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM workouts'
    );

    // Total exercises logged
    const exerciseCount = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercise_entries'
    );

    // Day streak calculation
    const workoutDates = db.getAllSync<{ day: string }>(
      `SELECT DISTINCT date(created_at / 1000, 'unixepoch', 'localtime') as day
       FROM workouts ORDER BY day DESC`
    );

    let streak = 0;
    if (workoutDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateStr(today);
      const yesterdayDate = new Date(today);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = formatDateStr(yesterdayDate);

      // Streak starts if most recent workout is today or yesterday
      if (workoutDates[0].day === todayStr || workoutDates[0].day === yesterdayStr) {
        streak = 1;
        for (let i = 1; i < workoutDates.length; i++) {
          const prevDate = new Date(workoutDates[i - 1].day);
          const currDate = new Date(workoutDates[i].day);
          const diffDays = Math.round(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    setStats({
      totalWorkouts: workoutCount?.count ?? 0,
      dayStreak: streak,
      totalExercises: exerciseCount?.count ?? 0,
    });

    // Personal records
    const prs = db.getAllSync<UserExerciseStats>(
      `SELECT * FROM user_exercise_stats
       WHERE personal_best IS NOT NULL
       ORDER BY last_used_at DESC`
    );
    setPersonalRecords(prs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const renderPR = ({ item }: ListRenderItemInfo<UserExerciseStats>) => {
    let pb: { weight?: number; reps?: number; unit?: string; date?: string } = {};
    try {
      pb = item.personal_best ? JSON.parse(item.personal_best) : {};
    } catch {}

    return (
      <View style={styles.prRow}>
        <View style={styles.prInfo}>
          <Text style={styles.prName}>{item.exercise_name}</Text>
          <Text style={styles.prMeta}>
            Used {item.use_count} time{item.use_count !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.prBest}>
          {pb.weight != null && (
            <Text style={styles.prWeight}>
              {pb.weight} {pb.unit ?? 'lbs'}
            </Text>
          )}
          {pb.reps != null && (
            <Text style={styles.prReps}>
              {pb.reps} rep{pb.reps !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.largeTitle}>Stats</Text>
      </View>

      <View style={styles.statCardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total{'\n'}Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {stats.dayStreak > 0 ? `${stats.dayStreak}\uD83D\uDD25` : '0'}
          </Text>
          <Text style={styles.statLabel}>Day{'\n'}Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalExercises}</Text>
          <Text style={styles.statLabel}>Total{'\n'}Exercises</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Records</Text>
        {personalRecords.length === 0 ? (
          <View style={styles.emptyPR}>
            <Text style={styles.emptyPRText}>
              Complete workouts to track your personal records
            </Text>
          </View>
        ) : (
          personalRecords.map((pr) => (
            <View key={pr.id}>
              {renderPR({ item: pr, index: 0, separators: {} as any })}
              <View style={styles.prSeparator} />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  statCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.card,
    borderRadius: 13,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.text,
    marginBottom: 12,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Theme.card,
    borderRadius: 13,
    marginBottom: 1,
  },
  prInfo: {
    flex: 1,
  },
  prName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.text,
    marginBottom: 2,
  },
  prMeta: {
    fontSize: 13,
    color: Theme.muted,
  },
  prBest: {
    alignItems: 'flex-end',
  },
  prWeight: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.accent,
  },
  prReps: {
    fontSize: 13,
    color: Theme.secondaryText,
  },
  prSeparator: {
    height: 1,
    backgroundColor: Theme.divider,
    marginHorizontal: 16,
  },
  emptyPR: {
    backgroundColor: Theme.card,
    borderRadius: 13,
    padding: 24,
    alignItems: 'center',
  },
  emptyPRText: {
    fontSize: 15,
    color: Theme.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
