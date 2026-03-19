import SwiftUI
import SwiftData

struct SetRowView: View {

    @Bindable var setEntry: SetEntry

    @State private var isEditing = false
    @State private var editWeight: String = ""
    @State private var editReps: String = ""

    var body: some View {
        HStack(spacing: 10) {
            // Completion checkbox
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    setEntry.isCompleted.toggle()
                }
            } label: {
                Image(systemName: setEntry.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundColor(setEntry.isCompleted ? .success : .muted)
            }
            .buttonStyle(.plain)

            // Set number
            Text("Set \(setEntry.setNumber)")
                .font(.subheadline)
                .foregroundColor(.muted)
                .frame(width: 44, alignment: .leading)

            if isEditing {
                editFields
            } else {
                displayText
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }

    // MARK: - Display Mode

    private var displayText: some View {
        Button {
            editWeight = formatWeight(setEntry.weight)
            editReps = "\(setEntry.reps)"
            isEditing = true
        } label: {
            HStack(spacing: 0) {
                if setEntry.weight > 0 {
                    Text("\(formatWeight(setEntry.weight)) \(setEntry.unit)")
                        .foregroundColor(setEntry.isCompleted ? .muted : .textPrimary)
                    Text(" \u{00D7} ")
                        .foregroundColor(.muted)
                }
                Text("\(setEntry.reps) reps")
                    .foregroundColor(setEntry.isCompleted ? .muted : .textPrimary)
            }
            .font(.body)
            .strikethrough(setEntry.isCompleted, color: .muted)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Edit Mode

    private var editFields: some View {
        HStack(spacing: 6) {
            TextField("0", text: $editWeight)
                .keyboardType(.decimalPad)
                .font(.body)
                .foregroundColor(.accent)
                .frame(width: 60)
                .padding(.horizontal, 8)
                .padding(.vertical, 6)
                .background(Color.elevated)
                .cornerRadius(8)

            Text(setEntry.unit)
                .font(.caption)
                .foregroundColor(.muted)

            Text("\u{00D7}")
                .foregroundColor(.muted)

            TextField("0", text: $editReps)
                .keyboardType(.numberPad)
                .font(.body)
                .foregroundColor(.accent)
                .frame(width: 44)
                .padding(.horizontal, 8)
                .padding(.vertical, 6)
                .background(Color.elevated)
                .cornerRadius(8)

            Text("reps")
                .font(.caption)
                .foregroundColor(.muted)

            Button {
                saveEdits()
            } label: {
                Image(systemName: "checkmark")
                    .font(.caption.bold())
                    .foregroundColor(.black)
                    .padding(6)
                    .background(Color.accent)
                    .cornerRadius(6)
            }
        }
    }

    // MARK: - Helpers

    private func saveEdits() {
        if let w = Double(editWeight) {
            setEntry.weight = w
        }
        if let r = Int(editReps) {
            setEntry.reps = r
        }
        isEditing = false
    }

    private func formatWeight(_ weight: Double) -> String {
        if weight.truncatingRemainder(dividingBy: 1) == 0 {
            return String(format: "%.0f", weight)
        }
        return String(format: "%.1f", weight)
    }
}

#Preview {
    VStack {
        SetRowView(setEntry: SetEntry(setNumber: 1, weight: 135, unit: "lbs", reps: 10, isCompleted: false))
        SetRowView(setEntry: SetEntry(setNumber: 2, weight: 135, unit: "lbs", reps: 10, isCompleted: true))
    }
    .padding()
    .background(Color.card)
    .preferredColorScheme(.dark)
}
