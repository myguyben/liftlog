import SwiftUI
import SwiftData

struct WorkoutDetailView: View {

    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @Bindable var workout: Workout

    @AppStorage("defaultUnit") private var defaultUnit = "lbs"

    @State private var showDeleteConfirmation = false
    @State private var newExerciseText = ""
    @State private var editingInsertIndex: Int? = nil
    @FocusState private var newLineFocused: Bool

    // Caches — pre-computed in .task, invalidated on changes
    @State private var sessionCache: [String: [DetailedSessionSnapshot]] = [:]
    @State private var profileCache: [String: ExerciseProgressProfile] = [:]

    @Query(sort: \ExerciseTemplate.name)
    private var allTemplates: [ExerciseTemplate]

    @Query(sort: \UserExerciseStats.lastUsedAt, order: .reverse)
    private var allStats: [UserExerciseStats]

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Title — like a note title
                    TextField("Workout Title", text: $workout.title)
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textPrimary)
                        .padding(.horizontal, 16)
                        .padding(.top, 16)

                    // Date
                    Text(workout.createdAt, format: .dateTime.weekday(.wide).month(.wide).day().year().hour().minute())
                        .font(.subheadline)
                        .foregroundColor(.muted)
                        .padding(.horizontal, 16)
                        .padding(.top, 4)

                    // Timer bar
                    if workout.startedAt != nil {
                        timerBar
                            .padding(.horizontal, 16)
                            .padding(.top, 8)
                    }

                    // Notes — like the first line of a note
                    TextField("Notes...", text: $workout.notes, axis: .vertical)
                        .font(.body)
                        .foregroundColor(.textSecondary)
                        .lineLimit(1...10)
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 8)

                    // Exercises flow like note content
                    let sorted = workout.exercises.sorted { $0.order < $1.order }
                    ForEach(Array(sorted.enumerated()), id: \.element.id) { index, exercise in
                        // Tappable gap between exercises
                        gapInput(at: index)

                        InlineExerciseView(
                            exercise: exercise,
                            sessions: sessionsForExercise(exercise),
                            profile: profileCache[exercise.name.lowercased()],
                            allTemplates: allTemplates,
                            onSetCompleted: {
                                workout.lastSetCompletedAt = .now
                                // Auto-reopen: if completed and user marks a new set, reactivate
                                if workout.isCompleted {
                                    workout.completedAt = nil
                                    workout.status = "active"
                                }
                                workout.updatedAt = .now
                                try? modelContext.save()
                                refreshCacheForExercise(exercise.name)
                            }
                        )
                        .padding(.horizontal, 16)
                    }

                    // Always-visible new line at the bottom — like typing the next line in Notes
                    bottomInput(at: sorted.count)
                        .id("bottomInput")
                }
                .padding(.bottom, 80)
            }
        }
        .background(Color.background)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showDeleteConfirmation = true
                } label: {
                    Image(systemName: "trash")
                        .foregroundColor(.danger)
                }
            }
        }
        .alert("Delete Workout?", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive) { deleteWorkout() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This workout and all its exercises will be permanently deleted.")
        }
        .task {
            loadAllCaches()
        }
    }

    // MARK: - Timer Bar

    @ViewBuilder
    private var timerBar: some View {
        if workout.isCompleted {
            // Completed — static duration with checkmark
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.success)
                Text(workout.elapsedDuration.shortDurationText)
                    .font(.subheadline)
                    .foregroundColor(.muted)
                Spacer()
            }
        } else {
            // Active — live elapsed timer
            TimelineView(.periodic(from: .now, by: 1)) { _ in
                HStack {
                    Text(workout.elapsedDuration.timerText)
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundColor(.accent)
                    Spacer()
                }
            }
        }
    }

    // MARK: - Cache Management

    private func loadAllCaches() {
        let exerciseNames = Set(workout.exercises.map { $0.name.lowercased() })
        for name in exerciseNames {
            loadCacheForExercise(name)
        }
    }

    private func loadCacheForExercise(_ exerciseName: String) {
        let key = exerciseName.lowercased()
        sessionCache[key] = fetchRecentSessions(for: exerciseName)
        profileCache[key] = fetchProfile(for: exerciseName)
    }

    private func refreshCacheForExercise(_ exerciseName: String) {
        loadCacheForExercise(exerciseName)
    }

    /// Returns session snapshots for an exercise, including the current workout's completed sets as the most recent entry
    private func sessionsForExercise(_ exercise: ExerciseEntry) -> [DetailedSessionSnapshot] {
        let key = exercise.name.lowercased()
        let historicalSessions = sessionCache[key] ?? []

        // Include current workout's completed sets as the most recent session snapshot
        let completedSets = exercise.sortedSets.filter { $0.isCompleted }
        guard !completedSets.isEmpty else { return historicalSessions }

        let setSnapshots = completedSets.map { s in
            SetSnapshot(
                setNumber: s.setNumber,
                weight: s.weight,
                reps: s.reps,
                rpe: s.rpe,
                isCompleted: s.isCompleted
            )
        }
        let currentSession = DetailedSessionSnapshot(
            sets: setSnapshots,
            date: workout.createdAt,
            unit: completedSets.first?.unit ?? "lbs"
        )

        return [currentSession] + historicalSessions
    }

    // MARK: - Gap input (tap between exercises to insert)

    private func gapInput(at index: Int) -> some View {
        Group {
            if editingInsertIndex == index {
                inlineInput(at: index)
            } else {
                // Subtle tappable line
                Color.clear
                    .frame(height: 20)
                    .contentShape(Rectangle())
                    .onTapGesture {
                        editingInsertIndex = index
                    }
                    .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Bottom input (always visible, like next line in Notes)

    private func bottomInput(at index: Int) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            // Autocomplete
            if !newExerciseText.isEmpty && editingInsertIndex == nil {
                autocompleteList
            }

            // Parse preview
            if !newExerciseText.isEmpty && editingInsertIndex == nil {
                parsePreview(for: newExerciseText)
            }

            TextField("Type exercise… e.g. Bench Press 135 10", text: $newExerciseText)
                .font(.body)
                .foregroundColor(.textPrimary)
                .focused($newLineFocused)
                .onSubmit {
                    submitExercise(newExerciseText, at: index)
                    newExerciseText = ""
                }
                .submitLabel(.done)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
        }
    }

    // MARK: - Inline input for inserting between exercises

    private func inlineInput(at index: Int) -> some View {
        InlineInsertField(
            templates: allTemplates,
            onSubmit: { text in
                submitExercise(text, at: index)
                editingInsertIndex = nil
            },
            onCancel: { editingInsertIndex = nil }
        )
        .padding(.horizontal, 16)
        .padding(.vertical, 4)
    }

    // MARK: - Autocomplete

    private var autocompleteList: some View {
        let q = newExerciseText.lowercased()
        let matches = allTemplates.filter { $0.name.lowercased().contains(q) }.prefix(4)
        return Group {
            if !matches.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(Array(matches), id: \.id) { template in
                        Button {
                            newExerciseText = template.name + " "
                        } label: {
                            Text(template.name)
                                .font(.subheadline)
                                .foregroundColor(.textPrimary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.vertical, 5)
                                .padding(.horizontal, 16)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func parsePreview(for text: String) -> some View {
        let parsed = ExerciseParser.parse(text)
        return Group {
            if parsed.weight != nil || parsed.reps != nil {
                HStack(spacing: 4) {
                    if !parsed.name.isEmpty {
                        Text(parsed.name).foregroundColor(.accent)
                    }
                    if let w = parsed.weight {
                        Text("\(w.clean) \(parsed.unit)").foregroundColor(.accent.opacity(0.7))
                    }
                    if let r = parsed.reps {
                        Text("× \(r)").foregroundColor(.accent.opacity(0.7))
                    }
                    if let s = parsed.sets, s > 1 {
                        Text("× \(s)s").foregroundColor(.accent.opacity(0.7))
                    }
                }
                .font(.caption)
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Actions

    private func submitExercise(_ input: String, at index: Int) {
        let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        var parsed = ExerciseParser.parse(trimmed)
        let name = parsed.name.isEmpty ? trimmed : parsed.name

        // Use the user's default unit when the parser didn't detect an explicit unit
        let inputHasExplicitUnit = trimmed.range(of: #"(lbs?|pounds?|kg|kgs?|kilograms?|#)"#, options: .regularExpression, range: nil, locale: nil) != nil
        if !inputHasExplicitUnit {
            parsed.unit = defaultUnit
        }

        // Shift existing exercises down
        let sorted = workout.exercises.sorted { $0.order < $1.order }
        for ex in sorted where ex.order >= index {
            ex.order += 1
        }

        let entry = ExerciseEntry(name: name, order: index)
        entry.workout = workout

        let numSets = parsed.sets ?? 1
        for i in 1...numSets {
            let set = SetEntry(
                setNumber: i,
                weight: parsed.weight ?? 0,
                unit: parsed.unit,
                reps: parsed.reps ?? 0,
                isCompleted: false
            )
            set.exerciseEntry = entry
            entry.sets.append(set)
            modelContext.insert(set)
        }

        workout.exercises.append(entry)
        modelContext.insert(entry)
        workout.updatedAt = .now
        try? modelContext.save()
        updateStats(for: name)

        // Pre-load cache for new exercise
        loadCacheForExercise(name)
    }

    private func updateStats(for exerciseName: String) {
        // Update UserExerciseStats only — profile updates happen on set completion
        let predicate = #Predicate<UserExerciseStats> { $0.exerciseName == exerciseName }
        let descriptor = FetchDescriptor<UserExerciseStats>(predicate: predicate)
        if let existing = try? modelContext.fetch(descriptor).first {
            existing.useCount += 1
            existing.lastUsedAt = .now
        } else {
            let stats = UserExerciseStats(exerciseName: exerciseName)
            modelContext.insert(stats)
        }
        try? modelContext.save()
    }

    private func fetchRecentSessions(for exerciseName: String) -> [DetailedSessionSnapshot] {
        var descriptor = FetchDescriptor<Workout>(sortBy: [SortDescriptor(\Workout.createdAt, order: .reverse)])
        descriptor.fetchLimit = 20
        guard let workouts = try? modelContext.fetch(descriptor) else { return [] }

        var snapshots: [DetailedSessionSnapshot] = []
        for w in workouts {
            guard w.persistentModelID != workout.persistentModelID else { continue }
            for ex in w.exercises where ex.name.lowercased() == exerciseName.lowercased() {
                let sets = ex.sortedSets
                guard !sets.isEmpty else { continue }
                let setSnapshots = sets.map { s in
                    SetSnapshot(
                        setNumber: s.setNumber,
                        weight: s.weight,
                        reps: s.reps,
                        rpe: s.rpe,
                        isCompleted: s.isCompleted
                    )
                }
                snapshots.append(DetailedSessionSnapshot(
                    sets: setSnapshots,
                    date: w.createdAt,
                    unit: sets.first?.unit ?? "lbs"
                ))
            }
        }
        return snapshots
    }

    private func fetchProfile(for exerciseName: String) -> ExerciseProgressProfile? {
        let predicate = #Predicate<ExerciseProgressProfile> { $0.exerciseName == exerciseName }
        let descriptor = FetchDescriptor<ExerciseProgressProfile>(predicate: predicate)
        return try? modelContext.fetch(descriptor).first
    }

    private func fetchOrCreateProfile(for exerciseName: String) -> ExerciseProgressProfile {
        if let existing = fetchProfile(for: exerciseName) {
            return existing
        }
        let template = findTemplate(for: exerciseName)
        let category = ExerciseCategory.classify(name: exerciseName, template: template)
        let profile = ExerciseProgressProfile(exerciseName: exerciseName, category: category.rawValue)
        profile.typicalMinReps = category.defaultMinReps
        profile.typicalMaxReps = category.defaultMaxReps
        modelContext.insert(profile)
        try? modelContext.save()
        return profile
    }

    private func findTemplate(for exerciseName: String) -> ExerciseTemplate? {
        allTemplates.first { $0.name.lowercased() == exerciseName.lowercased() }
    }

    private func deleteWorkout() {
        modelContext.delete(workout)
        try? modelContext.save()
        dismiss()
    }
}

// MARK: - Inline Insert Field (for between-exercise insertion)

struct InlineInsertField: View {
    var templates: [ExerciseTemplate]
    var onSubmit: (String) -> Void
    var onCancel: () -> Void

    @State private var text = ""
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if !text.isEmpty {
                let q = text.lowercased()
                let matches = templates.filter { $0.name.lowercased().contains(q) }.prefix(3)
                ForEach(Array(matches), id: \.id) { t in
                    Button { text = t.name + " " } label: {
                        Text(t.name)
                            .font(.subheadline)
                            .foregroundColor(.textPrimary)
                    }
                    .buttonStyle(.plain)
                }
            }

            TextField("Type exercise…", text: $text)
                .font(.body)
                .foregroundColor(.textPrimary)
                .focused($focused)
                .onSubmit {
                    if !text.isEmpty { onSubmit(text) }
                }
                .submitLabel(.done)
        }
        .onAppear { focused = true }
    }
}

// MARK: - Inline Exercise View

struct InlineExerciseView: View {

    @Environment(\.modelContext) private var modelContext
    @AppStorage("aiEnabled") private var aiEnabled = true
    @AppStorage("userBodyWeight") private var bodyWeightStr = ""
    @AppStorage("userExperience") private var experience = "intermediate"
    @AppStorage("userTrainingGoal") private var trainingGoal = "strength"
    @AppStorage("userTrainingDays") private var trainingDays = 4
    @Bindable var exercise: ExerciseEntry
    var sessions: [DetailedSessionSnapshot]
    var profile: ExerciseProgressProfile?
    var allTemplates: [ExerciseTemplate]
    var onSetCompleted: () -> Void

    private var userPreferences: UserPreferences {
        UserPreferences(
            experience: experience,
            trainingGoal: trainingGoal,
            trainingDays: trainingDays,
            bodyWeight: Double(bodyWeightStr)
        )
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Exercise name
            HStack(alignment: .firstTextBaseline) {
                Text(exercise.name)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.textPrimary)

                Spacer()

                Button { deleteExercise() } label: {
                    Text("remove")
                        .font(.system(size: 11))
                        .foregroundColor(.danger.opacity(0.6))
                }
            }

            // Last performance
            if let last = sessions.first {
                let fmt = RelativeDateTimeFormatter()
                let weightStr = last.topWeight > 0 ? "\(last.topWeight.clean) \(last.unit) × " : ""
                let totalReps = last.sets.filter(\.isCompleted).reduce(0) { $0 + $1.reps }
                Text("Last: \(weightStr)\(totalReps) reps (\(fmt.localizedString(for: last.date, relativeTo: .now)))")
                    .font(.caption)
                    .foregroundColor(.muted)
                    .padding(.top, 2)
            }

            // Overload badge — tappable pill with color coding
            if aiEnabled, let rec = recommendation {
                Button { applyRecommendation(rec) } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 5) {
                            Image(systemName: badgeIcon(rec))
                                .font(.system(size: 10, weight: .bold))
                            Text(badgeText(rec))
                                .font(.system(size: 12, weight: .semibold))
                            if rec.confidence == .low {
                                Text("(new)")
                                    .font(.system(size: 10))
                                    .opacity(0.6)
                            }
                        }
                        if let detail = rec.detail {
                            Text(detail)
                                .font(.system(size: 10))
                                .opacity(0.7)
                                .lineLimit(2)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(badgeColor(rec).opacity(0.15))
                    .foregroundColor(badgeColor(rec))
                    .cornerRadius(8)
                }
                .buttonStyle(.plain)
                .padding(.top, 6)
            }

            // Sets
            ForEach(exercise.sortedSets) { set in
                DirectSetRow(setEntry: set, onCompletionChanged: {
                    onSetCompleted()
                    updateProfileOnSetCompletion()
                })
            }
            .padding(.top, 6)
            .padding(.leading, 2)

            // + set
            Button { addSet() } label: {
                Text("+ set")
                    .font(.system(size: 13))
                    .foregroundColor(.accent)
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
            .padding(.leading, 2)
            .padding(.bottom, 8)
        }
    }

    // MARK: - Recommendation

    private var recommendation: OverloadRecommendation? {
        let template = allTemplates.first { $0.name.lowercased() == exercise.name.lowercased() }
        let category = ExerciseCategory.classify(name: exercise.name, template: template)

        guard !sessions.isEmpty else {
            // No history at all — check current workout's completed sets
            let completedSets = exercise.sortedSets.filter { $0.isCompleted }
            guard !completedSets.isEmpty else { return nil }

            let setSnapshots = completedSets.map { s in
                SetSnapshot(
                    setNumber: s.setNumber,
                    weight: s.weight,
                    reps: s.reps,
                    rpe: s.rpe,
                    isCompleted: s.isCompleted
                )
            }
            let currentSession = DetailedSessionSnapshot(
                sets: setSnapshots,
                date: .now,
                unit: completedSets.first?.unit ?? "lbs"
            )
            return OverloadEngine.recommend(
                sessions: [currentSession],
                profile: profile,
                category: category,
                preferences: userPreferences
            )
        }

        return OverloadEngine.recommend(
            sessions: sessions,
            profile: profile,
            category: category,
            preferences: userPreferences
        )
    }

    private func badgeIcon(_ rec: OverloadRecommendation) -> String {
        switch rec.type {
        case .increaseWeight: return "arrow.up"
        case .increaseReps: return "plus"
        case .maintain: return "equal"
        case .deload: return "arrow.down"
        case .microload: return "arrow.up.right"
        case .addSet: return "plus.square"
        }
    }

    private func badgeColor(_ rec: OverloadRecommendation) -> Color {
        switch rec.type {
        case .increaseWeight: return .green
        case .increaseReps: return .green
        case .maintain: return .blue
        case .deload: return .orange
        case .microload: return .yellow
        case .addSet: return .blue
        }
    }

    private func badgeText(_ rec: OverloadRecommendation) -> String {
        rec.message
    }

    private func applyRecommendation(_ rec: OverloadRecommendation) {
        let newNumber = (exercise.sortedSets.last?.setNumber ?? 0) + 1
        let set = SetEntry(
            setNumber: newNumber,
            weight: rec.weight,
            unit: rec.unit,
            reps: rec.reps,
            isCompleted: false
        )
        set.exerciseEntry = exercise
        exercise.sets.append(set)
        modelContext.insert(set)
        try? modelContext.save()
    }

    private func deleteExercise() {
        modelContext.delete(exercise)
        try? modelContext.save()
    }

    private func addSet() {
        let lastSet = exercise.sortedSets.last
        let newNumber = (lastSet?.setNumber ?? 0) + 1
        let set = SetEntry(
            setNumber: newNumber,
            weight: lastSet?.weight ?? 0,
            unit: lastSet?.unit ?? "lbs",
            reps: lastSet?.reps ?? 0,
            isCompleted: false
        )
        set.exerciseEntry = exercise
        exercise.sets.append(set)
        modelContext.insert(set)
        try? modelContext.save()
    }

    private func updateProfileOnSetCompletion() {
        // Only update profile when there are completed sets
        let completedSets = exercise.sortedSets.filter { $0.isCompleted }
        guard !completedSets.isEmpty else { return }

        // Find or create profile
        let exerciseName = exercise.name
        let predicate = #Predicate<ExerciseProgressProfile> { $0.exerciseName == exerciseName }
        let descriptor = FetchDescriptor<ExerciseProgressProfile>(predicate: predicate)
        let profile: ExerciseProgressProfile
        if let existing = try? modelContext.fetch(descriptor).first {
            profile = existing
        } else {
            let template = allTemplates.first { $0.name.lowercased() == exerciseName.lowercased() }
            let category = ExerciseCategory.classify(name: exerciseName, template: template)
            profile = ExerciseProgressProfile(exerciseName: exerciseName, category: category.rawValue)
            profile.typicalMinReps = category.defaultMinReps
            profile.typicalMaxReps = category.defaultMaxReps
            modelContext.insert(profile)
        }

        let setSnapshots = completedSets.map { s in
            SetSnapshot(
                setNumber: s.setNumber,
                weight: s.weight,
                reps: s.reps,
                rpe: s.rpe,
                isCompleted: s.isCompleted
            )
        }
        let currentSession = DetailedSessionSnapshot(
            sets: setSnapshots,
            date: .now,
            unit: completedSets.first?.unit ?? "lbs"
        )

        let template = allTemplates.first { $0.name.lowercased() == exerciseName.lowercased() }
        let category = ExerciseCategory.classify(name: exerciseName, template: template)
        ProfileUpdater.updateProfile(
            profile: profile,
            currentSession: currentSession,
            previousSessions: sessions,
            template: template,
            category: category
        )

        // Track personal records
        let statsPredicate = #Predicate<UserExerciseStats> { $0.exerciseName == exerciseName }
        let statsDescriptor = FetchDescriptor<UserExerciseStats>(predicate: statsPredicate)
        if let stats = try? modelContext.fetch(statsDescriptor).first {
            for set in completedSets {
                let currentVolume = set.weight * Double(set.reps)
                let existingVolume = (stats.prWeight ?? 0) * Double(stats.prReps ?? 0)
                if currentVolume > existingVolume {
                    stats.prWeight = set.weight
                    stats.prUnit = set.unit
                    stats.prReps = set.reps
                    stats.prDate = .now
                }
            }
        }

        try? modelContext.save()
    }
}

// MARK: - Direct Set Row

struct DirectSetRow: View {

    @Environment(\.modelContext) private var modelContext
    @Bindable var setEntry: SetEntry
    var onCompletionChanged: () -> Void

    @State private var weightText: String = ""
    @State private var repsText: String = ""
    @State private var isEditing = false

    var body: some View {
        HStack(spacing: 8) {
            Button {
                withAnimation(.easeInOut(duration: 0.15)) {
                    setEntry.isCompleted.toggle()
                    try? modelContext.save()
                    onCompletionChanged()
                }
            } label: {
                Image(systemName: setEntry.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 18))
                    .foregroundColor(setEntry.isCompleted ? .success : .muted.opacity(0.5))
            }
            .buttonStyle(.plain)

            if isEditing {
                editView
            } else {
                displayView
            }

            Spacer()
        }
        .padding(.vertical, 1)
    }

    private var displayView: some View {
        Button {
            weightText = setEntry.weight > 0 ? setEntry.weight.clean : ""
            repsText = setEntry.reps > 0 ? "\(setEntry.reps)" : ""
            isEditing = true
        } label: {
            HStack(spacing: 0) {
                if setEntry.weight > 0 {
                    Text("\(setEntry.weight.clean) \(setEntry.unit)")
                        .foregroundColor(setEntry.isCompleted ? .muted : .textPrimary)
                    Text(" × ")
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

    private var editView: some View {
        HStack(spacing: 6) {
            TextField("weight", text: $weightText)
                .keyboardType(.decimalPad)
                .font(.body)
                .foregroundColor(.textPrimary)
                .textFieldStyle(.roundedBorder)
                .frame(width: 80)
                .onChange(of: weightText) {
                    if let w = Double(weightText) { setEntry.weight = w }
                }

            Text(setEntry.unit)
                .font(.caption)
                .foregroundColor(.muted)

            Text("×")
                .foregroundColor(.muted)

            TextField("reps", text: $repsText)
                .keyboardType(.numberPad)
                .font(.body)
                .foregroundColor(.textPrimary)
                .textFieldStyle(.roundedBorder)
                .frame(width: 60)
                .onChange(of: repsText) {
                    if let r = Int(repsText) { setEntry.reps = r }
                }

            Button {
                if let w = Double(weightText) { setEntry.weight = w }
                if let r = Int(repsText) { setEntry.reps = r }
                try? modelContext.save()
                isEditing = false
            } label: {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.accent)
            }
        }
    }
}

// MARK: - Double formatting

extension Double {
    var clean: String {
        truncatingRemainder(dividingBy: 1) == 0
            ? String(format: "%.0f", self)
            : String(format: "%.1f", self)
    }
}

#Preview {
    NavigationStack {
        WorkoutDetailView(workout: Workout(title: "Push Day"))
    }
    .preferredColorScheme(.dark)
    .modelContainer(for: Workout.self, inMemory: true)
}
