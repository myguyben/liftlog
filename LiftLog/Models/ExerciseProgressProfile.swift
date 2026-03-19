import SwiftData
import Foundation

@Model
final class ExerciseProgressProfile {
    @Attribute(.unique) var exerciseName: String

    // Response tracking — learns how user responds to weight increases
    var successfulIncreases: Int
    var failedIncreases: Int
    var averageSessionsToProgress: Double
    var currentWeightSessionCount: Int
    var lastWorkingWeight: Double

    // Rep range learning — observed from user behavior
    var typicalMinReps: Int
    var typicalMaxReps: Int

    // Fatigue baseline
    var typicalRepDropoff: Double       // normal % decline from first to last working set
    var typicalRPE: Double?

    // Deload / fatigue tracking
    var lastDeloadDate: Date?
    var sessionsSinceDeload: Int

    // Plateau
    var lastWeightIncrease: Date?
    var longestPlateauSessions: Int

    // Category cache
    var resolvedCategory: String         // "upperCompound", "lowerCompound", "isolation", "bodyweight"

    var lastUpdated: Date

    init(exerciseName: String, category: String = "isolation") {
        self.exerciseName = exerciseName
        self.successfulIncreases = 0
        self.failedIncreases = 0
        self.averageSessionsToProgress = 3.0
        self.currentWeightSessionCount = 0
        self.lastWorkingWeight = 0
        self.typicalMinReps = 6
        self.typicalMaxReps = 12
        self.typicalRepDropoff = 0.1
        self.typicalRPE = nil
        self.lastDeloadDate = nil
        self.sessionsSinceDeload = 0
        self.lastWeightIncrease = nil
        self.longestPlateauSessions = 0
        self.resolvedCategory = category
        self.lastUpdated = .now
    }
}
