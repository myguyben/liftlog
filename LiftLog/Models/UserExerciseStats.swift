import SwiftData
import Foundation

@Model
final class UserExerciseStats {
    @Attribute(.unique) var exerciseName: String
    var lastUsedAt: Date
    var useCount: Int
    var prWeight: Double?
    var prUnit: String?
    var prReps: Int?
    var prDate: Date?

    init(exerciseName: String) {
        self.exerciseName = exerciseName
        self.lastUsedAt = .now
        self.useCount = 1
    }
}
