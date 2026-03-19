import SwiftUI
import SwiftData

struct StatsView: View {

    @Query private var workouts: [Workout]
    @Query(sort: \UserExerciseStats.lastUsedAt, order: .reverse)
    private var exerciseStats: [UserExerciseStats]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    summaryCards
                    personalRecordsSection
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 40)
            }
            .background(Color.background)
            .navigationTitle("Stats")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Summary Cards

    private var summaryCards: some View {
        HStack(spacing: 10) {
            StatCard(
                title: "Workouts",
                value: "\(workouts.count)",
                icon: "note.text"
            )

            StatCard(
                title: "Streak",
                value: "\(calculateStreak())\u{1F525}",
                icon: "flame.fill"
            )

            StatCard(
                title: "Exercises",
                value: "\(totalExercisesLogged)",
                icon: "dumbbell.fill"
            )
        }
    }

    // MARK: - Personal Records

    private var personalRecordsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Personal Records")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)

            if statsWithPRs.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "trophy")
                        .font(.system(size: 36))
                        .foregroundColor(.muted)
                    Text("No personal records yet")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                    Text("Complete workouts to set PRs")
                        .font(.caption)
                        .foregroundColor(.muted)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
            } else {
                ForEach(statsWithPRs) { stat in
                    PRRowView(stat: stat)
                }
            }
        }
    }

    // MARK: - Computed

    private var totalExercisesLogged: Int {
        workouts.reduce(0) { $0 + $1.exercises.count }
    }

    private var statsWithPRs: [UserExerciseStats] {
        exerciseStats.filter { $0.prWeight != nil }
    }

    /// Calculate day streak based on consecutive days with workouts.
    private func calculateStreak() -> Int {
        guard !workouts.isEmpty else { return 0 }

        let calendar = Calendar.current
        let sortedDates = workouts
            .map { calendar.startOfDay(for: $0.createdAt) }
            .sorted(by: >)

        // Remove duplicates (multiple workouts on same day)
        var uniqueDays: [Date] = []
        for date in sortedDates {
            if uniqueDays.last != date {
                uniqueDays.append(date)
            }
        }

        let today = calendar.startOfDay(for: .now)
        guard let mostRecent = uniqueDays.first,
              calendar.dateComponents([.day], from: mostRecent, to: today).day! <= 1 else {
            return 0
        }

        var streak = 1
        for i in 0..<(uniqueDays.count - 1) {
            let diff = calendar.dateComponents([.day], from: uniqueDays[i + 1], to: uniqueDays[i]).day!
            if diff == 1 {
                streak += 1
            } else {
                break
            }
        }

        return streak
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let title: String
    let value: String
    let icon: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(.accent)

            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.textPrimary)

            Text(title)
                .font(.caption)
                .foregroundColor(.muted)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }
}

// MARK: - PR Row

struct PRRowView: View {

    let stat: UserExerciseStats

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(stat.exerciseName)
                    .font(.body)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)

                if let date = stat.prDate {
                    Text(date, format: .dateTime.month(.abbreviated).day().year())
                        .font(.caption)
                        .foregroundColor(.muted)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                if let weight = stat.prWeight, let unit = stat.prUnit {
                    let weightStr = weight.truncatingRemainder(dividingBy: 1) == 0
                        ? String(format: "%.0f", weight)
                        : String(format: "%.1f", weight)
                    Text("\(weightStr) \(unit)")
                        .font(.body)
                        .fontWeight(.bold)
                        .foregroundColor(.accent)
                }
                if let reps = stat.prReps {
                    Text("\(reps) reps")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
            }

            Image(systemName: "trophy.fill")
                .font(.system(size: 14))
                .foregroundColor(.accent)
                .padding(.leading, 6)
        }
        .cardStyle()
    }
}

#Preview {
    StatsView()
        .preferredColorScheme(.dark)
        .modelContainer(for: [Workout.self, UserExerciseStats.self], inMemory: true)
}
