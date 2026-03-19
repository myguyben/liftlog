import SwiftUI
import SwiftData

struct WorkoutsView: View {

    @Environment(\.modelContext) private var modelContext

    @Query(sort: \Workout.createdAt, order: .reverse)
    private var workouts: [Workout]

    @State private var navigateToNewWorkout: Workout?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.background
                    .ignoresSafeArea()

                if workouts.isEmpty {
                    emptyState
                } else {
                    workoutList
                }
            }
            .navigationTitle("Workouts")
            .navigationBarTitleDisplayMode(.inline)
            .overlay(alignment: .bottomTrailing) {
                addButton
            }
            .navigationDestination(item: $navigateToNewWorkout) { workout in
                WorkoutDetailView(workout: workout)
            }
        }
    }

    // MARK: - Subviews

    private var workoutList: some View {
        ScrollView {
            LazyVStack(spacing: 10) {
                ForEach(workouts) { workout in
                    NavigationLink(destination: WorkoutDetailView(workout: workout)) {
                        WorkoutRowView(workout: workout)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 80)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "note.text")
                .font(.system(size: 56))
                .foregroundColor(.muted)
            Text("No Workouts Yet")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
            Text("Tap + to start your first workout")
                .font(.subheadline)
                .foregroundColor(.textSecondary)
        }
    }

    private var addButton: some View {
        Button {
            createNewWorkout()
        } label: {
            Image(systemName: "plus")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.black)
                .frame(width: 56, height: 56)
                .background(Color.accent)
                .cornerRadius(16)
                .shadow(color: Color.accent.opacity(0.4), radius: 8, y: 4)
        }
        .padding(.trailing, 20)
        .padding(.bottom, 20)
    }

    // MARK: - Actions

    private func createNewWorkout() {
        let workout = Workout()
        workout.status = "active"
        workout.startedAt = .now
        modelContext.insert(workout)
        try? modelContext.save()
        navigateToNewWorkout = workout
    }
}

// MARK: - Workout Row

struct WorkoutRowView: View {

    let workout: Workout

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Title + status/date
            HStack {
                Text(displayTitle)
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                    .lineLimit(1)

                Spacer()

                if workout.isActive {
                    TimelineView(.periodic(from: .now, by: 1)) { _ in
                        HStack(spacing: 4) {
                            Circle()
                                .fill(Color.success)
                                .frame(width: 7, height: 7)
                            Text(workout.elapsedDuration.timerText)
                                .font(.system(.caption, design: .monospaced))
                                .fontWeight(.medium)
                                .foregroundColor(.success)
                        }
                    }
                } else {
                    Text(workout.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.muted)
                }
            }

            // Exercise count + set count + duration
            let exercises = workout.exercises
            let totalSets = exercises.reduce(0) { $0 + $1.sets.count }
            let parts: [String] = {
                var p = ["\(exercises.count) exercise\(exercises.count == 1 ? "" : "s")",
                         "\(totalSets) set\(totalSets == 1 ? "" : "s")"]
                if workout.startedAt != nil {
                    p.append(workout.elapsedDuration.shortDurationText)
                }
                return p
            }()
            Text(parts.joined(separator: " \u{2022} "))
                .font(.subheadline)
                .foregroundColor(.textSecondary)

            // Preview of first 3 exercise names
            let sortedExercises = exercises.sorted { $0.order < $1.order }
            let previewNames = sortedExercises.prefix(3).map(\.name)
            if !previewNames.isEmpty {
                Text(previewNames.joined(separator: ", "))
                    .font(.caption)
                    .foregroundColor(.muted)
                    .lineLimit(1)
            }
        }
        .cardStyle()
    }

    private var displayTitle: String {
        if !workout.title.isEmpty { return workout.title }
        let cal = Calendar.current
        if cal.isDateInToday(workout.createdAt) { return "Today's Workout" }
        if cal.isDateInYesterday(workout.createdAt) { return "Yesterday's Workout" }
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE Workout"
        return formatter.string(from: workout.createdAt)
    }
}

#Preview {
    WorkoutsView()
        .preferredColorScheme(.dark)
        .modelContainer(for: Workout.self, inMemory: true)
}
