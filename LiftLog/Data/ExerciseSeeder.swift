import SwiftData
import Foundation

struct ExerciseSeeder {

    /// Seeds the SwiftData context with common exercise templates if none exist yet.
    @MainActor
    static func seedExercises(context: ModelContext) {
        // Check if templates already exist
        let descriptor = FetchDescriptor<ExerciseTemplate>()
        let existingCount = (try? context.fetchCount(descriptor)) ?? 0

        guard existingCount == 0 else { return }

        let templates = defaultTemplates()
        for template in templates {
            context.insert(template)
        }

        try? context.save()
    }

    // MARK: - Default Exercise Templates

    private static func defaultTemplates() -> [ExerciseTemplate] {
        return [
            // Chest
            ExerciseTemplate(
                id: "barbell-bench-press", name: "Barbell Bench Press", equipment: "barbell",
                primaryMuscles: "chest", secondaryMuscles: "triceps,shoulders",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "incline-barbell-bench-press", name: "Incline Barbell Bench Press", equipment: "barbell",
                primaryMuscles: "chest", secondaryMuscles: "triceps,shoulders",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "dumbbell-bench-press", name: "Dumbbell Bench Press", equipment: "dumbbell",
                primaryMuscles: "chest", secondaryMuscles: "triceps,shoulders",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "dumbbell-fly", name: "Dumbbell Fly", equipment: "dumbbell",
                primaryMuscles: "chest", secondaryMuscles: "shoulders",
                category: "strength", level: "intermediate", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "cable-crossover", name: "Cable Crossover", equipment: "cable",
                primaryMuscles: "chest", secondaryMuscles: "shoulders",
                category: "strength", level: "intermediate", force: "push", mechanic: "isolation"
            ),

            // Back
            ExerciseTemplate(
                id: "deadlift", name: "Deadlift", equipment: "barbell",
                primaryMuscles: "lower back,hamstrings", secondaryMuscles: "glutes,traps,forearms",
                category: "strength", level: "intermediate", force: "pull", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "barbell-row", name: "Barbell Row", equipment: "barbell",
                primaryMuscles: "middle back", secondaryMuscles: "biceps,lats",
                category: "strength", level: "intermediate", force: "pull", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "pull-up", name: "Pull Up", equipment: "body only",
                primaryMuscles: "lats", secondaryMuscles: "biceps,middle back",
                category: "strength", level: "intermediate", force: "pull", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "chin-up", name: "Chin Up", equipment: "body only",
                primaryMuscles: "lats,biceps", secondaryMuscles: "middle back",
                category: "strength", level: "intermediate", force: "pull", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "lat-pulldown", name: "Lat Pulldown", equipment: "cable",
                primaryMuscles: "lats", secondaryMuscles: "biceps,middle back",
                category: "strength", level: "beginner", force: "pull", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "seated-cable-row", name: "Seated Cable Row", equipment: "cable",
                primaryMuscles: "middle back", secondaryMuscles: "biceps,lats",
                category: "strength", level: "beginner", force: "pull", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "t-bar-row", name: "T-Bar Row", equipment: "barbell",
                primaryMuscles: "middle back", secondaryMuscles: "biceps,lats",
                category: "strength", level: "intermediate", force: "pull", mechanic: "compound"
            ),

            // Shoulders
            ExerciseTemplate(
                id: "overhead-press", name: "Overhead Press", equipment: "barbell",
                primaryMuscles: "shoulders", secondaryMuscles: "triceps",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "dumbbell-shoulder-press", name: "Dumbbell Shoulder Press", equipment: "dumbbell",
                primaryMuscles: "shoulders", secondaryMuscles: "triceps",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "lateral-raise", name: "Lateral Raise", equipment: "dumbbell",
                primaryMuscles: "shoulders", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "front-raise", name: "Front Raise", equipment: "dumbbell",
                primaryMuscles: "shoulders", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "face-pull", name: "Face Pull", equipment: "cable",
                primaryMuscles: "shoulders", secondaryMuscles: "traps,middle back",
                category: "strength", level: "beginner", force: "pull", mechanic: "isolation"
            ),

            // Legs
            ExerciseTemplate(
                id: "barbell-squat", name: "Barbell Squat", equipment: "barbell",
                primaryMuscles: "quadriceps", secondaryMuscles: "glutes,hamstrings,lower back",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "front-squat", name: "Front Squat", equipment: "barbell",
                primaryMuscles: "quadriceps", secondaryMuscles: "glutes,hamstrings",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "leg-press", name: "Leg Press", equipment: "machine",
                primaryMuscles: "quadriceps", secondaryMuscles: "glutes,hamstrings",
                category: "strength", level: "beginner", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "romanian-deadlift", name: "Romanian Deadlift", equipment: "barbell",
                primaryMuscles: "hamstrings", secondaryMuscles: "glutes,lower back",
                category: "strength", level: "intermediate", force: "pull", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "leg-curl", name: "Leg Curl", equipment: "machine",
                primaryMuscles: "hamstrings", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "pull", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "leg-extension", name: "Leg Extension", equipment: "machine",
                primaryMuscles: "quadriceps", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "calf-raise", name: "Calf Raise", equipment: "machine",
                primaryMuscles: "calves", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "bulgarian-split-squat", name: "Bulgarian Split Squat", equipment: "dumbbell",
                primaryMuscles: "quadriceps", secondaryMuscles: "glutes,hamstrings",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "hip-thrust", name: "Hip Thrust", equipment: "barbell",
                primaryMuscles: "glutes", secondaryMuscles: "hamstrings",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "lunges", name: "Lunges", equipment: "dumbbell",
                primaryMuscles: "quadriceps", secondaryMuscles: "glutes,hamstrings",
                category: "strength", level: "beginner", force: "push", mechanic: "compound"
            ),

            // Arms - Biceps
            ExerciseTemplate(
                id: "barbell-curl", name: "Barbell Curl", equipment: "barbell",
                primaryMuscles: "biceps", secondaryMuscles: "forearms",
                category: "strength", level: "beginner", force: "pull", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "dumbbell-curl", name: "Dumbbell Curl", equipment: "dumbbell",
                primaryMuscles: "biceps", secondaryMuscles: "forearms",
                category: "strength", level: "beginner", force: "pull", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "hammer-curl", name: "Hammer Curl", equipment: "dumbbell",
                primaryMuscles: "biceps", secondaryMuscles: "forearms",
                category: "strength", level: "beginner", force: "pull", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "preacher-curl", name: "Preacher Curl", equipment: "barbell",
                primaryMuscles: "biceps", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "pull", mechanic: "isolation"
            ),

            // Arms - Triceps
            ExerciseTemplate(
                id: "tricep-pushdown", name: "Tricep Pushdown", equipment: "cable",
                primaryMuscles: "triceps", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "skull-crusher", name: "Skull Crusher", equipment: "barbell",
                primaryMuscles: "triceps", secondaryMuscles: "",
                category: "strength", level: "intermediate", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "overhead-tricep-extension", name: "Overhead Tricep Extension", equipment: "dumbbell",
                primaryMuscles: "triceps", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "close-grip-bench-press", name: "Close Grip Bench Press", equipment: "barbell",
                primaryMuscles: "triceps", secondaryMuscles: "chest,shoulders",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),
            ExerciseTemplate(
                id: "dips", name: "Dips", equipment: "body only",
                primaryMuscles: "triceps,chest", secondaryMuscles: "shoulders",
                category: "strength", level: "intermediate", force: "push", mechanic: "compound"
            ),

            // Core
            ExerciseTemplate(
                id: "plank", name: "Plank", equipment: "body only",
                primaryMuscles: "abdominals", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "push", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "hanging-leg-raise", name: "Hanging Leg Raise", equipment: "body only",
                primaryMuscles: "abdominals", secondaryMuscles: "hip flexors",
                category: "strength", level: "intermediate", force: "pull", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "cable-crunch", name: "Cable Crunch", equipment: "cable",
                primaryMuscles: "abdominals", secondaryMuscles: "",
                category: "strength", level: "beginner", force: "pull", mechanic: "isolation"
            ),
            ExerciseTemplate(
                id: "ab-wheel-rollout", name: "Ab Wheel Rollout", equipment: "other",
                primaryMuscles: "abdominals", secondaryMuscles: "lower back",
                category: "strength", level: "intermediate", force: "pull", mechanic: "compound"
            ),
        ]
    }
}
