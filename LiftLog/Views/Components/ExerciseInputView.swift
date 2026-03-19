import SwiftUI
import SwiftData

struct ExerciseInputView: View {

    @Binding var inputText: String
    var templates: [ExerciseTemplate]
    var onSubmit: (String) -> Void

    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Autocomplete suggestions
            if !templates.isEmpty && isFocused {
                autocompleteList
            }

            // Parse preview
            if !inputText.isEmpty {
                parsePreview
            }

            // Input field
            HStack(spacing: 10) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(.accent)

                TextField("Add exercise...", text: $inputText)
                    .font(.body)
                    .foregroundColor(.textPrimary)
                    .focused($isFocused)
                    .onSubmit {
                        submitExercise()
                    }
                    .submitLabel(.done)

                if !inputText.isEmpty {
                    Button {
                        submitExercise()
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.accent)
                    }
                }
            }
            .padding(12)
            .background(Color.card)
            .cornerRadius(13)
        }
    }

    // MARK: - Autocomplete

    private var autocompleteList: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(templates, id: \.id) { template in
                Button {
                    selectTemplate(template)
                } label: {
                    HStack {
                        Text(template.name)
                            .font(.subheadline)
                            .foregroundColor(.textPrimary)

                        Spacer()

                        Text(template.equipment)
                            .font(.caption2)
                            .foregroundColor(.textSecondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.elevated)
                            .cornerRadius(4)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                }
                .buttonStyle(.plain)

                if template.id != templates.last?.id {
                    Divider()
                        .overlay(Color.divider)
                        .padding(.leading, 12)
                }
            }
        }
        .background(Color.card)
        .cornerRadius(13)
        .padding(.bottom, 6)
    }

    // MARK: - Parse Preview

    private var parsePreview: some View {
        let parsed = ExerciseParser.parse(inputText)
        return HStack(spacing: 6) {
            if !parsed.name.isEmpty {
                Text(parsed.name)
                    .font(.caption)
                    .foregroundColor(.accent)
            }
            if let weight = parsed.weight {
                let weightStr = weight.truncatingRemainder(dividingBy: 1) == 0
                    ? String(format: "%.0f", weight)
                    : String(format: "%.1f", weight)
                Text("\(weightStr) \(parsed.unit)")
                    .font(.caption)
                    .foregroundColor(.accent.opacity(0.8))
            }
            if let reps = parsed.reps {
                Text("\u{00D7} \(reps) reps")
                    .font(.caption)
                    .foregroundColor(.accent.opacity(0.8))
            }
            if let sets = parsed.sets, sets > 1 {
                Text("\u{00D7} \(sets) sets")
                    .font(.caption)
                    .foregroundColor(.accent.opacity(0.8))
            }
            Spacer()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
    }

    // MARK: - Actions

    private func selectTemplate(_ template: ExerciseTemplate) {
        // Replace just the name part, keep any numeric data the user typed
        let parsed = ExerciseParser.parse(inputText)
        if parsed.weight != nil || parsed.reps != nil {
            // User already typed numbers, just replace the name
            inputText = template.name
            if let w = parsed.weight {
                let ws = w.truncatingRemainder(dividingBy: 1) == 0
                    ? String(format: "%.0f", w)
                    : String(format: "%.1f", w)
                inputText += " \(ws)\(parsed.unit)"
            }
            if let r = parsed.reps {
                inputText += " x \(r)"
            }
        } else {
            inputText = template.name + " "
        }
    }

    private func submitExercise() {
        guard !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        onSubmit(inputText)
        inputText = ""
        isFocused = false
    }
}

#Preview {
    VStack {
        Spacer()
        ExerciseInputView(
            inputText: .constant("Bench"),
            templates: [],
            onSubmit: { _ in }
        )
    }
    .padding()
    .background(Color.background)
    .preferredColorScheme(.dark)
}
