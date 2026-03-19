import SwiftUI
import SwiftData

struct ExerciseLibraryView: View {

    @Query(sort: \ExerciseTemplate.name)
    private var templates: [ExerciseTemplate]

    @State private var searchText = ""
    @State private var selectedMuscleGroup = "All"

    private let muscleGroups = [
        "All", "Chest", "Back", "Shoulders", "Quadriceps",
        "Hamstrings", "Biceps", "Triceps", "Glutes",
        "Calves", "Abdominals"
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.background
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    muscleGroupChips
                    templateList
                }
            }
            .navigationTitle("Exercises")
            .searchable(text: $searchText, prompt: "Search exercises...")
        }
    }

    // MARK: - Muscle Group Filter Chips

    private var muscleGroupChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(muscleGroups, id: \.self) { group in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedMuscleGroup = group
                        }
                    } label: {
                        Text(group)
                            .font(.subheadline)
                            .fontWeight(selectedMuscleGroup == group ? .semibold : .regular)
                            .foregroundColor(selectedMuscleGroup == group ? .black : .textSecondary)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                selectedMuscleGroup == group
                                    ? Color.accent
                                    : Color.card
                            )
                            .cornerRadius(20)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }
    }

    // MARK: - Template List

    private var templateList: some View {
        List {
            ForEach(filteredTemplates) { template in
                ExerciseTemplateRow(template: template)
                    .listRowBackground(Color.card)
                    .listRowSeparatorTint(Color.divider)
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }

    private var filteredTemplates: [ExerciseTemplate] {
        templates.filter { template in
            let matchesSearch = searchText.isEmpty ||
                template.name.localizedCaseInsensitiveContains(searchText)

            let matchesMuscle = selectedMuscleGroup == "All" ||
                template.primaryMuscles.localizedCaseInsensitiveContains(selectedMuscleGroup)

            return matchesSearch && matchesMuscle
        }
    }
}

// MARK: - Template Row

struct ExerciseTemplateRow: View {

    let template: ExerciseTemplate

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(template.name)
                .font(.body)
                .fontWeight(.medium)
                .foregroundColor(.textPrimary)

            HStack(spacing: 8) {
                // Equipment tag
                TagView(text: template.equipment.capitalized, color: .blue)

                // Category tag
                TagView(text: template.category.capitalized, color: .purple)

                // Muscle group
                Text(template.primaryMuscles.capitalized)
                    .font(.caption2)
                    .foregroundColor(.muted)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Tag View

struct TagView: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text)
            .font(.caption2)
            .fontWeight(.medium)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.3))
            .cornerRadius(6)
    }
}

#Preview {
    ExerciseLibraryView()
        .preferredColorScheme(.dark)
        .modelContainer(for: ExerciseTemplate.self, inMemory: true)
}
