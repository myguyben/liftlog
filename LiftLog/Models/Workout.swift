import SwiftData
import Foundation

@Model
final class Workout {
    var date: Date
    var title: String
    var notes: String
    var createdAt: Date
    var updatedAt: Date

    @Relationship(deleteRule: .cascade, inverse: \ExerciseEntry.workout)
    var exercises: [ExerciseEntry]

    init(date: Date = .now, title: String = "", notes: String = "") {
        self.date = date
        self.title = title
        self.notes = notes
        self.createdAt = .now
        self.updatedAt = .now
        self.exercises = []
    }
}
