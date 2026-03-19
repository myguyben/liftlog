import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { getDb } from '@/lib/database';
import { parseExerciseInput } from '@/lib/parser';
import type {
  Workout,
  ExerciseEntry,
  SetEntry,
  ExerciseTemplate,
} from '@/lib/models';

interface ExerciseWithSets extends ExerciseEntry {
  sets: SetEntry[];
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workoutId = Number(id);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<ExerciseTemplate[]>([]);
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const loadWorkout = useCallback(() => {
    const db = getDb();
    const w = db.getFirstSync<Workout>(
      'SELECT * FROM workouts WHERE id = ?',
      [workoutId]
    );
    if (!w) return;
    setWorkout(w);
    setTitle(w.title);
    setNotes(w.notes ?? '');

    const entries = db.getAllSync<ExerciseEntry>(
      'SELECT * FROM exercise_entries WHERE workout_id = ? ORDER BY sort_order ASC',
      [workoutId]
    );

    const withSets: ExerciseWithSets[] = entries.map((entry) => {
      const sets = db.getAllSync<SetEntry>(
        'SELECT * FROM set_entries WHERE exercise_entry_id = ? ORDER BY set_number ASC',
        [entry.id]
      );
      return { ...entry, sets };
    });

    setExercises(withSets);
  }, [workoutId]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const saveTitle = () => {
    if (!workout || title === workout.title) return;
    const db = getDb();
    db.runSync('UPDATE workouts SET title = ?, updated_at = ? WHERE id = ?', [
      title,
      Date.now(),
      workoutId,
    ]);
  };

  const saveNotes = () => {
    if (!workout || notes === (workout.notes ?? '')) return;
    const db = getDb();
    db.runSync('UPDATE workouts SET notes = ?, updated_at = ? WHERE id = ?', [
      notes,
      Date.now(),
      workoutId,
    ]);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (text.trim().length > 0) {
      const db = getDb();
      const matches = db.getAllSync<ExerciseTemplate>(
        'SELECT * FROM exercise_templates WHERE name LIKE ? LIMIT 5',
        [`%${text.trim()}%`]
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const addExerciseFromInput = (overrideName?: string) => {
    const textToParse = overrideName ?? inputText;
    if (!textToParse.trim()) return;

    const parsed = parseExerciseInput(textToParse);
    if (!parsed || !parsed.name) return;

    const db = getDb();
    const now = Date.now();
    const sortOrder = exercises.length;

    const result = db.runSync(
      'INSERT INTO exercise_entries (workout_id, name, sort_order, notes, created_at) VALUES (?, ?, ?, ?, ?)',
      [workoutId, parsed.name, sortOrder, null, now]
    );
    const exerciseEntryId = result.lastInsertRowId;

    // Create sets based on parsed data
    const numSets = parsed.sets ?? 1;
    for (let i = 1; i <= numSets; i++) {
      db.runSync(
        'INSERT INTO set_entries (exercise_entry_id, set_number, weight, unit, reps, rpe, completed, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          exerciseEntryId,
          i,
          parsed.weight ?? 0,
          parsed.unit ?? 'lbs',
          parsed.reps ?? 0,
          null,
          parsed.weight != null || parsed.reps != null ? 1 : 0,
          now,
        ]
      );
    }

    // Update user exercise stats
    const existing = db.getFirstSync<{ id: number; use_count: number; personal_best: string | null }>(
      'SELECT id, use_count, personal_best FROM user_exercise_stats WHERE exercise_name = ?',
      [parsed.name]
    );

    if (existing) {
      let newPB = existing.personal_best;
      if (parsed.weight != null) {
        const currentPB = existing.personal_best ? JSON.parse(existing.personal_best) : null;
        if (!currentPB || (parsed.weight > (currentPB.weight ?? 0))) {
          newPB = JSON.stringify({ weight: parsed.weight, reps: parsed.reps, unit: parsed.unit, date: new Date().toISOString() });
        }
      }
      db.runSync(
        'UPDATE user_exercise_stats SET use_count = use_count + 1, last_used_at = ?, personal_best = ? WHERE id = ?',
        [now, newPB, existing.id]
      );
    } else {
      const pb = parsed.weight != null
        ? JSON.stringify({ weight: parsed.weight, reps: parsed.reps, unit: parsed.unit, date: new Date().toISOString() })
        : null;
      db.runSync(
        'INSERT INTO user_exercise_stats (exercise_name, last_used_at, use_count, personal_best) VALUES (?, ?, 1, ?)',
        [parsed.name, now, pb]
      );
    }

    db.runSync('UPDATE workouts SET updated_at = ? WHERE id = ?', [now, workoutId]);

    setInputText('');
    setSuggestions([]);
    loadWorkout();

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const selectSuggestion = (template: ExerciseTemplate) => {
    // If user just typed a name, use the template name
    const currentParsed = parseExerciseInput(inputText);
    if (currentParsed && (currentParsed.weight != null || currentParsed.reps != null)) {
      // Has numbers, replace the name portion
      const newText = `${template.name} ${currentParsed.weight ?? ''} ${currentParsed.unit ?? ''} x ${currentParsed.reps ?? ''}`.trim();
      setInputText(newText);
      setSuggestions([]);
    } else {
      setInputText(template.name);
      setSuggestions([]);
    }
  };

  const addSet = (exerciseEntryId: number) => {
    const db = getDb();
    const exercise = exercises.find((e) => e.id === exerciseEntryId);
    if (!exercise) return;

    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSetNumber = exercise.sets.length + 1;
    const now = Date.now();

    db.runSync(
      'INSERT INTO set_entries (exercise_entry_id, set_number, weight, unit, reps, rpe, completed, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        exerciseEntryId,
        newSetNumber,
        lastSet?.weight ?? 0,
        lastSet?.unit ?? 'lbs',
        lastSet?.reps ?? 0,
        null,
        0,
        now,
      ]
    );

    db.runSync('UPDATE workouts SET updated_at = ? WHERE id = ?', [now, workoutId]);
    loadWorkout();
  };

  const toggleSetComplete = (setId: number, currentValue: number) => {
    const db = getDb();
    db.runSync('UPDATE set_entries SET completed = ? WHERE id = ?', [
      currentValue === 1 ? 0 : 1,
      setId,
    ]);
    loadWorkout();
  };

  const startEditSet = (set: SetEntry) => {
    setEditingSet(set.id);
    setEditWeight(String(set.weight));
    setEditReps(String(set.reps));
  };

  const saveEditSet = () => {
    if (editingSet === null) return;
    const db = getDb();
    const w = parseFloat(editWeight) || 0;
    const r = parseInt(editReps, 10) || 0;
    db.runSync('UPDATE set_entries SET weight = ?, reps = ? WHERE id = ?', [w, r, editingSet]);
    setEditingSet(null);
    loadWorkout();
  };

  const deleteWorkout = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const db = getDb();
            // Delete in order due to foreign keys
            db.runSync(
              `DELETE FROM set_entries WHERE exercise_entry_id IN
               (SELECT id FROM exercise_entries WHERE workout_id = ?)`,
              [workoutId]
            );
            db.runSync('DELETE FROM exercise_entries WHERE workout_id = ?', [workoutId]);
            db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
            router.back();
          },
        },
      ]
    );
  };

  const formatFullDate = (dateStr: string) => {
    return dateStr;
  };

  if (!workout) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'\u2039'} Workouts</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2039'} Workouts</Text>
        </Pressable>
        <Pressable onPress={deleteWorkout} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>{'\uD83D\uDDD1'}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          onBlur={saveTitle}
          placeholder="Workout Title"
          placeholderTextColor={Theme.muted}
          returnKeyType="done"
          blurOnSubmit
        />

        {/* Date */}
        <Text style={styles.dateText}>{formatFullDate(workout.date)}</Text>

        {/* Notes */}
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          onBlur={saveNotes}
          placeholder="Add notes..."
          placeholderTextColor={Theme.muted}
          multiline
          textAlignVertical="top"
        />

        {/* Exercises */}
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>

            {exercise.sets.map((set) => (
              <View key={set.id} style={styles.setRow}>
                {/* Checkbox */}
                <Pressable
                  onPress={() => toggleSetComplete(set.id, set.completed)}
                  style={styles.checkbox}
                >
                  <View
                    style={[
                      styles.checkCircle,
                      set.completed === 1 && styles.checkCircleComplete,
                    ]}
                  >
                    {set.completed === 1 && (
                      <Text style={styles.checkmark}>{'\u2713'}</Text>
                    )}
                  </View>
                </Pressable>

                {/* Set info - tap to edit */}
                {editingSet === set.id ? (
                  <View style={styles.editSetRow}>
                    <TextInput
                      style={styles.editInput}
                      value={editWeight}
                      onChangeText={setEditWeight}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={Theme.muted}
                      autoFocus
                    />
                    <Text style={styles.editUnit}>{set.unit}</Text>
                    <Text style={styles.editX}>{'\u00D7'}</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editReps}
                      onChangeText={setEditReps}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={Theme.muted}
                    />
                    <Text style={styles.editUnit}>reps</Text>
                    <Pressable onPress={saveEditSet} style={styles.editDone}>
                      <Text style={styles.editDoneText}>Done</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => startEditSet(set)}
                    style={styles.setInfo}
                  >
                    <Text
                      style={[
                        styles.setText,
                        set.completed === 1 && styles.setTextComplete,
                      ]}
                    >
                      {set.weight > 0
                        ? `${set.weight} ${set.unit} \u00D7 ${set.reps}`
                        : set.reps > 0
                        ? `${set.reps} reps`
                        : 'Tap to edit'}
                    </Text>
                    <Text style={styles.setNumber}>Set {set.set_number}</Text>
                  </Pressable>
                )}
              </View>
            ))}

            <Pressable
              onPress={() => addSet(exercise.id)}
              style={styles.addSetButton}
            >
              <Text style={styles.addSetText}>+ Add Set</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((s) => (
            <Pressable
              key={s.id}
              style={styles.suggestionRow}
              onPress={() => selectSuggestion(s)}
            >
              <Text style={styles.suggestionName}>{s.name}</Text>
              {s.equipment && (
                <Text style={styles.suggestionEquipment}>{s.equipment}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Bottom input */}
      <View style={styles.bottomInput}>
        <TextInput
          style={styles.exerciseInput}
          value={inputText}
          onChangeText={handleInputChange}
          onSubmitEditing={() => addExerciseFromInput()}
          placeholder="Add exercise... (e.g. Bench Press 135 x 10)"
          placeholderTextColor={Theme.muted}
          returnKeyType="done"
          autoCorrect={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Theme.background,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  backText: {
    fontSize: 17,
    color: Theme.accent,
    fontWeight: '400',
  },
  deleteButton: {
    paddingVertical: 4,
    paddingLeft: 16,
  },
  deleteIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.text,
    paddingVertical: 8,
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: Theme.muted,
    marginBottom: 16,
  },
  notesInput: {
    fontSize: 16,
    color: Theme.secondaryText,
    minHeight: 40,
    marginBottom: 24,
    lineHeight: 22,
  },
  exerciseBlock: {
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.text,
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.divider,
  },
  checkbox: {
    marginRight: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleComplete: {
    borderColor: Theme.success,
    backgroundColor: Theme.success,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: -1,
  },
  setInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setText: {
    fontSize: 16,
    color: Theme.text,
  },
  setTextComplete: {
    color: Theme.secondaryText,
  },
  setNumber: {
    fontSize: 12,
    color: Theme.muted,
  },
  editSetRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editInput: {
    backgroundColor: Theme.elevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    color: Theme.text,
    width: 60,
    textAlign: 'center',
  },
  editUnit: {
    fontSize: 14,
    color: Theme.muted,
  },
  editX: {
    fontSize: 16,
    color: Theme.muted,
  },
  editDone: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editDoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.accent,
  },
  addSetButton: {
    paddingVertical: 10,
    paddingLeft: 36,
  },
  addSetText: {
    fontSize: 15,
    color: Theme.accent,
    fontWeight: '500',
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: Theme.elevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.divider,
    maxHeight: 220,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.divider,
  },
  suggestionName: {
    fontSize: 16,
    color: Theme.text,
    fontWeight: '500',
  },
  suggestionEquipment: {
    fontSize: 13,
    color: Theme.muted,
    textTransform: 'capitalize',
  },
  bottomInput: {
    backgroundColor: Theme.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.divider,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 34,
  },
  exerciseInput: {
    fontSize: 16,
    color: Theme.text,
    backgroundColor: Theme.elevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 42,
  },
});
