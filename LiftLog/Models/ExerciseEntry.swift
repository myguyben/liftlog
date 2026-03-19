import SwiftData
import Foundation

@Model
final class ExerciseEntry {
    var workout: Workout?
    var name: String
    var order: Int
    var notes: String
    var createdAt: Date

    @Relationship(deleteRule: .cascade, inverse: \SetEntry.exerciseEntry)
    var sets: [SetEntry]

    init(name: String, order: Int = 0, notes: String = "") {
        self.name = name
        self.order = order
        self.notes = notes
        self.createdAt = .now
        self.sets = []
    }

    var sortedSets: [SetEntry] {
        sets.sorted { $0.setNumber < $1.setNumber }
    }
}
