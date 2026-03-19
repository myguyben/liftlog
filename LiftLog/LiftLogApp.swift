import SwiftUI
import SwiftData

@main
struct LiftLogApp: App {

    let modelContainer: ModelContainer

    init() {
        // Configure global navigation bar appearance
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = .black
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance
        UINavigationBar.appearance().tintColor = UIColor(red: 1, green: 0.84, blue: 0.04, alpha: 1)

        do {
            modelContainer = try ModelContainer(for:
                Workout.self,
                ExerciseEntry.self,
                SetEntry.self,
                ExerciseTemplate.self,
                UserExerciseStats.self
            )
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
                .task {
                    await seedOnFirstLaunch()
                }
        }
        .modelContainer(modelContainer)
    }

    @MainActor
    private func seedOnFirstLaunch() {
        let context = modelContainer.mainContext
        ExerciseSeeder.seedExercises(context: context)
    }
}
