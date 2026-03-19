import Foundation

// MARK: - Exercise Category

enum ExerciseCategory: String, CaseIterable, Codable {
    case upperCompound
    case lowerCompound
    case isolation
    case bodyweight

    var weightIncrement: Double {
        switch self {
        case .upperCompound: return 5.0
        case .lowerCompound: return 10.0
        case .isolation: return 2.5
        case .bodyweight: return 0.0
        }
    }

    var displayName: String {
        switch self {
        case .upperCompound: return "Upper Compound"
        case .lowerCompound: return "Lower Compound"
        case .isolation: return "Isolation"
        case .bodyweight: return "Bodyweight"
        }
    }
}

// MARK: - Overload Type

enum OverloadType: String {
    case increaseWeight
    case increaseReps
    case maintain
    case deload
}

// MARK: - Session Snapshot

/// Represents one session's performance for a single exercise.
struct SessionSnapshot {
    var weight: Double
    var unit: String
    var targetReps: Int
    var completedReps: Int
    var sets: Int
    var date: Date

    /// Whether the lifter hit all target reps across all sets.
    var allRepsCompleted: Bool {
        completedReps >= targetReps * sets
    }
}

// MARK: - Overload Recommendation

struct OverloadRecommendation {
    var type: OverloadType
    var weight: Double
    var unit: String
    var reps: Int
    var message: String
}

// MARK: - Overload Engine

struct OverloadEngine {

    /// Compute the next-session recommendation based on recent history.
    ///
    /// - Parameters:
    ///   - sessions: Recent sessions for this exercise, ordered newest-first. Typically 1-5 sessions.
    ///   - category: The exercise's category for determining weight increments.
    ///   - unit: Preferred weight unit ("lbs" or "kg").
    /// - Returns: A recommendation, or `nil` if there is no history.
    static func computeOverload(
        sessions: [SessionSnapshot],
        category: ExerciseCategory,
        unit: String = "lbs"
    ) -> OverloadRecommendation? {

        guard let latest = sessions.first else {
            return nil  // No history
        }

        // Bodyweight exercises: always recommend +1 rep
        if category == .bodyweight {
            return OverloadRecommendation(
                type: .increaseReps,
                weight: latest.weight,
                unit: unit,
                reps: latest.completedReps + 1,
                message: "Add 1 rep to progress this bodyweight exercise."
            )
        }

        // Check for 3 consecutive declining sessions
        if sessions.count >= 3 {
            let recentThree = Array(sessions.prefix(3))
            let declining = isConsecutivelyDeclining(recentThree)
            if declining {
                let deloadWeight = roundToNearest(latest.weight * 0.9, increment: category.weightIncrement)
                return OverloadRecommendation(
                    type: .deload,
                    weight: deloadWeight,
                    unit: unit,
                    reps: latest.targetReps,
                    message: "Performance declined over 3 sessions. Deload to \(formatWeight(deloadWeight)) \(unit) and rebuild."
                )
            }
        }

        // All reps completed -> increase weight
        if latest.allRepsCompleted {
            let increment = convertIncrement(category.weightIncrement, toUnit: unit)
            let newWeight = latest.weight + increment
            return OverloadRecommendation(
                type: .increaseWeight,
                weight: newWeight,
                unit: unit,
                reps: latest.targetReps,
                message: "All reps completed! Increase weight to \(formatWeight(newWeight)) \(unit)."
            )
        }

        // Partial reps -> maintain weight, suggest +1 rep on weakest set
        let deficit = (latest.targetReps * latest.sets) - latest.completedReps
        return OverloadRecommendation(
            type: .maintain,
            weight: latest.weight,
            unit: unit,
            reps: latest.targetReps,
            message: "Missed \(deficit) rep\(deficit == 1 ? "" : "s"). Keep \(formatWeight(latest.weight)) \(unit) and aim for +1 rep on your weakest set."
        )
    }

    // MARK: - Helpers

    /// Check whether the 3 most recent sessions show declining total reps.
    private static func isConsecutivelyDeclining(_ sessions: [SessionSnapshot]) -> Bool {
        guard sessions.count >= 3 else { return false }
        let totals = sessions.map { $0.completedReps }
        // sessions are newest-first, so totals[0] is most recent
        // declining means each older session was better: totals[2] > totals[1] > totals[0]
        return totals[0] < totals[1] && totals[1] < totals[2]
    }

    /// Round a weight to the nearest increment.
    private static func roundToNearest(_ value: Double, increment: Double) -> Double {
        guard increment > 0 else { return value }
        return (value / increment).rounded() * increment
    }

    /// Convert a lbs-based increment to the target unit.
    private static func convertIncrement(_ lbsIncrement: Double, toUnit unit: String) -> Double {
        if unit == "kg" {
            // Approximate conversion: round to nearest 0.5 kg
            let kgRaw = lbsIncrement * 0.453592
            return (kgRaw * 2).rounded() / 2
        }
        return lbsIncrement
    }

    /// Format a weight for display, dropping the decimal if it's a whole number.
    private static func formatWeight(_ weight: Double) -> String {
        if weight == weight.rounded() && weight.truncatingRemainder(dividingBy: 1) == 0 {
            return String(format: "%.0f", weight)
        }
        return String(format: "%.1f", weight)
    }
}
