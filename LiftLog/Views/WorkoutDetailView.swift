import SwiftUI
import SwiftData

struct WorkoutDetailView: View {

    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @Bindable var workout: Workout

    @State private var exerciseInput = ""
    @State private var showDeleteConfirmation = false
    @State private var showAutocomplete = false

    @Query(sort: \ExerciseTemplate.name)
    private var allTemplates: [ExerciseTemplate]

    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                titleSection
                dateSection
                notesSection
                Divider()
                    .overlay(Color.divider)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                exercisesList
                exerciseInputSection
            }
            .padding(.bottom, 40)
        }
        .background(Color.background)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showDeleteConfirmation = true
                } label: {
                    Image(systemName: "trash")
                        .foregroundColor(.danger)
                }
            }
        }
        .alert("Delete Workout?", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive) {
                deleteWorkout()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This workout and all its exercises will be permanently deleted.")
        }
    }

    // MARK: - Title

    private var titleSection: some View {
        TextField("Workout Title", text: $workout.title)
            .font(.system(size: 28, weight: .bold))
            .foregroundColor(.textPrimary)
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .onChange(of: workout.title) {
                workout.updatedAt = .now
            }
    }

    // MARK: - Date

    private var dateSection: some View {
        Text(workout.createdAt, format: .dateTime.weekday(.wide).month(.wide).day().year().hour().minute())
            .font(.subheadline)
            .foregroundColor(.muted)
            .padding(.horizontal, 16)
            .padding(.top, 4)
    }

    // MARK: - Notes

    private var notesSection: some View {
        TextField("Notes...", text: $workout.notes, axis: .vertical)
            .font(.body)
            .foregroundColor(.textSecondary)
            .lineLimit(1...6)
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 4)
            .onChange(of: workout.notes) {
                workout.updatedAt = .now
            }
    }

    // MARK: - Exercises List

    private var exercisesList: some View {
        let sorted = workout.exercises.sorted { $0.order < $1.order }
        return ForEach(sorted) { exercise in
            ExerciseBlockView(exercise: exercise)
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
        }
    }

    // MARK: - Exercise Input

    private var exerciseInputSection: some View {
        ExerciseInputView(
            inputText: $exerciseInput,
            templates: filteredTemplates,
            onSubmit: addExercise
        )
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }

    private var filteredTemplates: [ExerciseTemplate] {
        guard !exerciseInput.isEmpty else { return [] }
        let query = exerciseInput.lowercased()
        return allTemplates.filter {
            $0.name.lowercased().contains(query)
        }.prefix(5).map { $0 }
    }

    // MARK: - Actions

    private func addExercise(_ input: String) {
        let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let parsed = ExerciseParser.parse(trimmed)
        let name = parsed.name.isEmpty ? trimmed : parsed.name
        let order = workout.exercises.count

        let entry = ExerciseEntry(name: name, order: order)
        entry.workout = workout

        // If weight/reps were parsed, create an initial set
        let numSets = parsed.sets ?? 1
        for i in 1...numSets {
            let set = SetEntry(
                setNumber: i,
                weight: parsed.weight ?? 0,
                unit: parsed.unit,
                reps: parsed.reps ?? 0,
                isCompleted: false
            )
            set.exerciseEntry = entry
            entry.sets.append(set)
            modelContext.insert(set)
        }

        workout.exercises.append(entry)
        modelContext.insert(entry)
        workout.updatedAt = .now
        try? modelContext.save()

        exerciseInput = ""

        // Update UserExerciseStats
        updateStats(for: name)
    }

    private func updateStats(for exerciseName: String) {
        let predicate = #Predicate<UserExerciseStats> { $0.exerciseName == exerciseName }
        let descriptor = FetchDescriptor<UserExerciseStats>(predicate: predicate)
        if let existing = try? modelContext.fetch(descriptor).first {
            existing.useCount += 1
            existing.lastUsedAt = .now
        } else {
            let stats = UserExerciseStats(exerciseName: exerciseName)
            modelContext.insert(stats)
        }
        try? modelContext.save()
    }

    private func deleteWorkout() {
        modelContext.delete(workout)
        try? modelContext.save()
        dismiss()
    }
}

// MARK: - Exercise Block

struct ExerciseBlockView: View {

    @Environment(\.modelContext) private var modelContext
    @Bindable var exercise: ExerciseEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Exercise name heading
            Text(exercise.name)
                .font(.system(size: 17, weight: .bold))
                .foregroundColor(.textPrimary)

            // Sets
            ForEach(exercise.sortedSets) { set in
                SetRowView(setEntry: set)
            }

            // Add set button
            Button {
                addSet()
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "plus")
                        .font(.caption)
                    Text("Add Set")
                        .font(.subheadline)
                }
                .foregroundColor(.accent)
            }
            .padding(.top, 2)
        }
        .padding(14)
        .background(Color.card)
        .cornerRadius(13)
    }

    private func addSet() {
        let lastSet = exercise.sortedSets.last
        let newNumber = (lastSet?.setNumber ?? 0) + 1
        let set = SetEntry(
            setNumber: newNumber,
            weight: lastSet?.weight ?? 0,
            unit: lastSet?.unit ?? "lbs",
            reps: lastSet?.reps ?? 0,
            isCompleted: false
        )
        set.exerciseEntry = exercise
        exercise.sets.append(set)
        modelContext.insert(set)
        try? modelContext.save()
    }
}

#Preview {
    NavigationStack {
        WorkoutDetailView(workout: Workout(title: "Push Day"))
    }
    .preferredColorScheme(.dark)
    .modelContainer(for: Workout.self, inMemory: true)
}
