import SwiftData
import Foundation

@Model
final class Workout {
    var date: Date
    var title: String
    var notes: String
    var createdAt: Date
    var updatedAt: Date

    // Workout lifecycle — optional so SwiftData can auto-migrate existing rows
    var status: String?
    var startedAt: Date?
    var completedAt: Date?
    var pausedAt: Date?              // Legacy — no longer written, kept for migration
    var totalPausedDuration: Double?  // Legacy — no longer written, kept for migration
    var lastSetCompletedAt: Date?

    @Relationship(deleteRule: .cascade, inverse: \ExerciseEntry.workout)
    var exercises: [ExerciseEntry]

    init(date: Date = .now, title: String = "", notes: String = "") {
        self.date = date
        self.title = title
        self.notes = notes
        self.createdAt = .now
        self.updatedAt = .now
        self.exercises = []
        self.status = "completed"
        self.startedAt = nil
        self.completedAt = nil
        self.lastSetCompletedAt = nil
    }

    // MARK: - Computed

    /// Effective status — treats nil (pre-existing workouts) as "completed"
    var effectiveStatus: String { status ?? "completed" }
    var isActive: Bool { effectiveStatus == "active" }
    var isCompleted: Bool { effectiveStatus == "completed" }

    /// Elapsed workout duration in seconds
    var elapsedDuration: TimeInterval {
        guard let start = startedAt else { return 0 }
        let end = completedAt ?? Date.now
        return max(0, end.timeIntervalSince(start))
    }

    /// Auto-end threshold in seconds (30 minutes)
    static let staleThreshold: TimeInterval = 30 * 60

    /// True if no set has been completed for 30+ minutes (or no sets and started 30+ min ago)
    var isStale: Bool {
        let reference = lastSetCompletedAt ?? startedAt ?? Date.distantPast
        return Date.now.timeIntervalSince(reference) >= Workout.staleThreshold
    }
}

// MARK: - Duration Formatting

extension TimeInterval {
    /// Full timer format: "0:42:15" or "12:05"
    var timerText: String {
        let totalSeconds = Int(self)
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        let seconds = totalSeconds % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        }
        return String(format: "%d:%02d", minutes, seconds)
    }

    /// Short format for lists: "42 min" or "1h 12min"
    var shortDurationText: String {
        let totalMinutes = Int(self) / 60
        if totalMinutes < 1 { return "<1 min" }
        if totalMinutes >= 60 {
            let h = totalMinutes / 60
            let m = totalMinutes % 60
            return m > 0 ? "\(h)h \(m)min" : "\(h)h"
        }
        return "\(totalMinutes) min"
    }
}
