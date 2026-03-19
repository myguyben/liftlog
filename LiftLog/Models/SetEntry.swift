import SwiftData
import Foundation

@Model
final class SetEntry {
    var exerciseEntry: ExerciseEntry?
    var setNumber: Int
    var weight: Double
    var unit: String  // "lbs" or "kg"
    var reps: Int
    var rpe: Double?
    var isCompleted: Bool
    var timestamp: Date

    init(setNumber: Int, weight: Double = 0, unit: String = "lbs", reps: Int = 0, isCompleted: Bool = true) {
        self.setNumber = setNumber
        self.weight = weight
        self.unit = unit
        self.reps = reps
        self.rpe = nil
        self.isCompleted = isCompleted
        self.timestamp = .now
    }
}
