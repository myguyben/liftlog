import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Pressable,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Theme } from '@/constants/theme';
import { getDb } from '@/lib/database';
import type { ExerciseTemplate } from '@/lib/models';

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Core',
  'Calves',
];

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  const loadExercises = useCallback(() => {
    const db = getDb();
    let query = 'SELECT * FROM exercise_templates';
    const params: string[] = [];
    const conditions: string[] = [];

    if (search.trim()) {
      conditions.push('name LIKE ?');
      params.push(`%${search.trim()}%`);
    }

    if (selectedMuscle !== 'All') {
      conditions.push('(primary_muscles LIKE ? OR secondary_muscles LIKE ?)');
      const muscleParam = `%${selectedMuscle.toLowerCase()}%`;
      params.push(muscleParam, muscleParam);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name ASC';

    const rows = db.getAllSync<ExerciseTemplate>(query, params);
    setExercises(rows);
  }, [search, selectedMuscle]);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const getEquipmentColor = (equipment: string | null) => {
    return Theme.blue;
  };

  const getCategoryColor = () => {
    return '#BF5AF2'; // purple
  };

  const renderExercise = ({ item }: ListRenderItemInfo<ExerciseTemplate>) => (
    <View style={styles.exerciseRow}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.tagRow}>
        {item.equipment && (
          <View style={[styles.tag, { backgroundColor: getEquipmentColor(item.equipment) + '22' }]}>
            <Text style={[styles.tagText, { color: getEquipmentColor(item.equipment) }]}>
              {item.equipment}
            </Text>
          </View>
        )}
        {item.category && (
          <View style={[styles.tag, { backgroundColor: getCategoryColor() + '22' }]}>
            <Text style={[styles.tagText, { color: getCategoryColor() }]}>
              {item.category}
            </Text>
          </View>
        )}
      </View>
      {item.primary_muscles && (
        <Text style={styles.muscleText}>
          {item.primary_muscles}
          {item.secondary_muscles ? ` \u00B7 ${item.secondary_muscles}` : ''}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.largeTitle}>Exercises</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>{'  '}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={Theme.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Text style={styles.clearButton}>{'  '}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.chipContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {MUSCLE_GROUPS.map((muscle) => (
            <Pressable
              key={muscle}
              style={[
                styles.chip,
                selectedMuscle === muscle && styles.chipSelected,
              ]}
              onPress={() => setSelectedMuscle(muscle)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedMuscle === muscle && styles.chipTextSelected,
                ]}
              >
                {muscle}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={exercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.elevated,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.text,
    height: 40,
  },
  clearButton: {
    fontSize: 16,
    padding: 4,
  },
  chipContainer: {
    marginBottom: 8,
  },
  chipScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Theme.elevated,
  },
  chipSelected: {
    backgroundColor: Theme.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.secondaryText,
  },
  chipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  exerciseRow: {
    paddingVertical: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.text,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  muscleText: {
    fontSize: 13,
    color: Theme.muted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Theme.divider,
  },
});
