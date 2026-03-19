import SwiftData
import Foundation

@Model
final class ExerciseTemplate {
    @Attribute(.unique) var id: String
    var name: String
    var equipment: String
    var primaryMuscles: String   // comma-separated
    var secondaryMuscles: String
    var category: String
    var level: String
    var force: String
    var mechanic: String

    init(id: String, name: String, equipment: String, primaryMuscles: String, secondaryMuscles: String = "", category: String = "strength", level: String = "intermediate", force: String = "push", mechanic: String = "compound") {
        self.id = id
        self.name = name
        self.equipment = equipment
        self.primaryMuscles = primaryMuscles
        self.secondaryMuscles = secondaryMuscles
        self.category = category
        self.level = level
        self.force = force
        self.mechanic = mechanic
    }
}
