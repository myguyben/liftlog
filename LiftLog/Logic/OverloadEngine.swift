import Foundation

// MARK: - Exercise Category

enum ExerciseCategory: String, CaseIterable, Codable {
    case upperCompound
    case lowerCompound
    case isolation
    case bodyweight

    /// Standard weight increment for this category in the given unit system
    func weightIncrement(for unit: String) -> Double {
        if unit == "kg" {
            switch self {
            case .upperCompound: return 2.5
            case .lowerCompound: return 5.0
            case .isolation: return 1.25
            case .bodyweight: return 0.0
            }
        }
        switch self {
        case .upperCompound: return 5.0
        case .lowerCompound: return 10.0
        case .isolation: return 2.5
        case .bodyweight: return 0.0
        }
    }

    /// Microload increment for plateau-breaking in the given unit system
    func microloadIncrement(for unit: String) -> Double {
        if unit == "kg" {
            switch self {
            case .upperCompound: return 1.25
            case .lowerCompound: return 2.5
            case .isolation: return 0.5
            case .bodyweight: return 0.0
            }
        }
        switch self {
        case .upperCompound: return 2.5
        case .lowerCompound: return 5.0
        case .isolation: return 1.25
        case .bodyweight: return 0.0
        }
    }

    var defaultMinReps: Int {
        switch self {
        case .upperCompound, .lowerCompound: return 5
        case .isolation: return 8
        case .bodyweight: return 5
        }
    }

    var defaultMaxReps: Int {
        switch self {
        case .upperCompound, .lowerCompound: return 8
        case .isolation: return 12
        case .bodyweight: return 20
        }
    }

    var displayName: String {
        switch self {
        case .upperCompound: return "Upper Compound"
        case .lowerCompound: return "Lower Compound"
        case .isolation: return "Isolation"
        case .bodyweight: return "Bodyweight"
        }
    }

    /// Unified classification: template-based first, string fallback second
    static func classify(name: String, template: ExerciseTemplate?) -> ExerciseCategory {
        if let tmpl = template {
            let equipment = tmpl.equipment.lowercased()
            if equipment == "body only" || equipment == "bodyweight" {
                return .bodyweight
            }
            let mechanic = tmpl.mechanic.lowercased()
            if mechanic == "compound" {
                let primary = tmpl.primaryMuscles.lowercased()
                let lowerMuscles = ["quadriceps", "hamstrings", "glutes", "calves", "lower back"]
                let isLower = lowerMuscles.contains(where: { primary.contains($0) })
                return isLower ? .lowerCompound : .upperCompound
            }
            return .isolation
        }

        // String-based fallback
        let l = name.lowercased()
        if ["bench press", "overhead press", "military press", "incline press", "dumbbell press", "shoulder press", "push press"].contains(where: { l.contains($0) }) { return .upperCompound }
        if ["squat", "deadlift", "leg press", "hip thrust", "romanian deadlift", "front squat", "sumo deadlift"].contains(where: { l.contains($0) }) { return .lowerCompound }
        if ["pull-up", "pullup", "push-up", "pushup", "dip", "chin-up", "chinup", "plank"].contains(where: { l.contains($0) }) { return .bodyweight }
        return .isolation
    }
}

// MARK: - Overload Type

enum OverloadType: String {
    case increaseWeight
    case increaseReps
    case maintain
    case deload
    case microload
    case addSet
}

// MARK: - Recommendation Confidence

enum RecommendationConfidence: String {
    case high    // 5+ sessions of history
    case medium  // 2-4 sessions
    case low     // 0-1 sessions
}

// MARK: - Overload Recommendation

struct OverloadRecommendation {
    var type: OverloadType
    var weight: Double
    var unit: String
    var reps: Int
    var message: String
    var sets: Int?
    var detail: String?
    var confidence: RecommendationConfidence

    init(type: OverloadType, weight: Double, unit: String, reps: Int, message: String,
         sets: Int? = nil, detail: String? = nil, confidence: RecommendationConfidence = .medium) {
        self.type = type
        self.weight = weight
        self.unit = unit
        self.reps = reps
        self.message = message
        self.sets = sets
        self.detail = detail
        self.confidence = confidence
    }
}

// MARK: - User Preferences

struct UserPreferences {
    var experience: String   // "beginner", "intermediate", "advanced"
    var trainingGoal: String // "strength", "hypertrophy", "endurance", "general"
    var trainingDays: Int
    var bodyWeight: Double?

    /// Default rep range based on the user's training goal
    var goalMinReps: Int {
        switch trainingGoal {
        case "strength": return 3
        case "hypertrophy": return 8
        case "endurance": return 15
        default: return 6
        }
    }

    var goalMaxReps: Int {
        switch trainingGoal {
        case "strength": return 5
        case "hypertrophy": return 12
        case "endurance": return 20
        default: return 12
        }
    }

    /// Fatigue deload threshold — beginners fatigue faster, advanced lifters tolerate more
    var fatigueDeloadThreshold: Double {
        switch experience {
        case "beginner": return 50
        case "advanced": return 70
        default: return 60
        }
    }

    /// Sessions-since-deload threshold, scaled by training frequency
    var deloadSessionThreshold: Int {
        max(12, 24 - trainingDays * 2)
    }
}

// MARK: - Overload Engine

struct OverloadEngine {

    /// Adaptive recommendation engine
    static func recommend(
        sessions: [DetailedSessionSnapshot],
        profile: ExerciseProgressProfile?,
        category: ExerciseCategory,
        preferences: UserPreferences? = nil
    ) -> OverloadRecommendation? {

        guard let latest = sessions.first else { return nil }

        let unit = latest.unit
        let confidence = confidenceLevel(sessionCount: sessions.count)

        // Use profile rep range, then goal-based defaults, then category defaults
        let minReps: Int
        let maxReps: Int
        if let p = profile, p.typicalMinReps != category.defaultMinReps || p.typicalMaxReps != category.defaultMaxReps {
            // Profile has learned rep ranges
            minReps = p.typicalMinReps
            maxReps = p.typicalMaxReps
        } else if let prefs = preferences {
            minReps = prefs.goalMinReps
            maxReps = prefs.goalMaxReps
        } else {
            minReps = profile?.typicalMinReps ?? category.defaultMinReps
            maxReps = profile?.typicalMaxReps ?? category.defaultMaxReps
        }

        let fatigueThreshold = preferences?.fatigueDeloadThreshold ?? 60.0
        let deloadSessionThreshold = preferences?.deloadSessionThreshold ?? 16
        let fatigue = PerformanceAnalyzer.analyzeFatigue(sessions: sessions, profile: profile, deloadSessionThreshold: deloadSessionThreshold)
        let plateau = PerformanceAnalyzer.detectPlateau(sessions: sessions, profile: profile)
        let repRange = PerformanceAnalyzer.detectRepRangePosition(sessions: sessions, profile: profile)
        _ = PerformanceAnalyzer.analyzeVolumeTrend(sessions: sessions)

        let currentWeight = latest.topWeight
        let workingReps = latest.workingSetReps

        // ── Priority 1: Deload ──
        // Fatigue above threshold, OR stagnated at same weight for 3 consecutive sessions
        let stagnated3x = hasStagnatedAtWeight(sessions: sessions, maxReps: maxReps, times: 3)
        if fatigue.score > fatigueThreshold || stagnated3x {
            let increment = category.weightIncrement(for: unit)
            let deloadWeight = category == .bodyweight ? 0.0 : roundToNearest(currentWeight * 0.85, increment: increment)
            let reason = fatigue.score > 60
                ? "Fatigue signals detected"
                : "Struggled at this weight for 3 sessions"
            if category == .bodyweight {
                let deloadReps = max(minReps, (workingReps.max() ?? minReps) - 3)
                return OverloadRecommendation(
                    type: .deload,
                    weight: 0,
                    unit: unit,
                    reps: deloadReps,
                    message: "Deload to \(deloadReps) reps",
                    detail: "\(reason). Drop reps and rebuild.",
                    confidence: confidence
                )
            }
            return OverloadRecommendation(
                type: .deload,
                weight: deloadWeight,
                unit: unit,
                reps: minReps,
                message: "Deload to \(formatWeight(deloadWeight)) \(unit)",
                detail: "\(reason). Drop to 85% and rebuild from \(minReps) reps.",
                confidence: confidence
            )
        }

        // ── Priority 2: Plateau breaker ──
        if plateau.isPlateaued {
            switch plateau.suggestedStrategy {
            case .microload:
                if category == .bodyweight {
                    // Bodyweight can't microload — use rep expansion instead
                    let targetReps = min((workingReps.max() ?? minReps) + 1, maxReps + 2) // +2 overshoot to break through ceiling before next progression strategy
                    return OverloadRecommendation(
                        type: .increaseReps,
                        weight: 0,
                        unit: unit,
                        reps: targetReps,
                        message: "Push to \(targetReps) reps",
                        detail: "Stuck for \(plateau.sessionsStuck) sessions. Expand rep range.",
                        confidence: confidence
                    )
                }
                let microInc = category.microloadIncrement(for: unit)
                let microWeight = roundToNearest(currentWeight + microInc, increment: microInc)
                return OverloadRecommendation(
                    type: .microload,
                    weight: microWeight,
                    unit: unit,
                    reps: workingReps.min() ?? minReps,
                    message: "Microload to \(formatWeight(microWeight)) \(unit)",
                    detail: "Stuck for \(plateau.sessionsStuck) sessions. Try a smaller jump.",
                    confidence: confidence
                )
            case .repExpansion:
                let targetReps = min((workingReps.max() ?? minReps) + 1, maxReps + 2) // +2 overshoot to break through ceiling before next progression strategy
                return OverloadRecommendation(
                    type: .increaseReps,
                    weight: currentWeight,
                    unit: unit,
                    reps: targetReps,
                    message: "Push to \(targetReps) reps at \(formatWeight(currentWeight)) \(unit)",
                    detail: "Stuck for \(plateau.sessionsStuck) sessions. Expand rep range before next weight jump.",
                    confidence: confidence
                )
            case .deloadAndRebuild:
                let increment = category.weightIncrement(for: unit)
                let deloadWeight = category == .bodyweight ? 0.0 : roundToNearest(currentWeight * 0.85, increment: increment)
                if category == .bodyweight {
                    let deloadReps = max(minReps, (workingReps.max() ?? minReps) - 3)
                    return OverloadRecommendation(
                        type: .deload,
                        weight: 0,
                        unit: unit,
                        reps: deloadReps,
                        message: "Deload to \(deloadReps) reps",
                        detail: "Plateaued for \(plateau.sessionsStuck) sessions. Drop reps and rebuild.",
                        confidence: confidence
                    )
                }
                return OverloadRecommendation(
                    type: .deload,
                    weight: deloadWeight,
                    unit: unit,
                    reps: minReps,
                    message: "Deload to \(formatWeight(deloadWeight)) \(unit)",
                    detail: "Plateaued for \(plateau.sessionsStuck) sessions. Deload and rebuild stronger.",
                    confidence: confidence
                )
            case .volumeAdjustment, .none:
                let newSets = (latest.completedSetCount) + 1
                return OverloadRecommendation(
                    type: .addSet,
                    weight: currentWeight,
                    unit: unit,
                    reps: workingReps.min() ?? minReps,
                    message: "Add a set at \(formatWeight(currentWeight)) \(unit)",
                    sets: newSets,
                    detail: "More volume may break through the plateau.",
                    confidence: confidence
                )
            }
        }

        // ── Priority 3: Double progression — increase weight ──
        // (Bodyweight skips this — no weight to increase)
        if repRange.readyToGraduate && category != .bodyweight {
            let increment = category.weightIncrement(for: unit)
            let newWeight = roundToNearest(currentWeight + increment, increment: increment)
            return OverloadRecommendation(
                type: .increaseWeight,
                weight: newWeight,
                unit: unit,
                reps: minReps,
                message: "\(formatWeight(newWeight)) \(unit) × \(minReps)",
                detail: "Hit \(maxReps) reps on all sets! Time to go up.",
                confidence: confidence
            )
        }

        // ── Priority 4: Double progression — increase reps ──
        let currentMinReps = workingReps.min() ?? minReps
        if !workingReps.isEmpty && currentMinReps >= minReps && currentMinReps < maxReps {
            let targetReps = currentMinReps + 1
            let repsToGo = maxReps - currentMinReps
            // Show which sets still need work
            let weakSets = workingReps.enumerated().filter { $0.element < maxReps }
            let detailMsg: String
            if weakSets.count < workingReps.count || workingReps.count == 1 {
                detailMsg = "\(repsToGo) more rep\(repsToGo == 1 ? "" : "s") to go up in weight."
            } else {
                let setNumbers = weakSets.map { "set \($0.offset + 1)" }
                let needsList = setNumbers.prefix(3).joined(separator: ", ")
                detailMsg = "Get all sets to \(maxReps) reps — \(needsList) need\(weakSets.count == 1 ? "s" : "") \(repsToGo) more."
            }
            return OverloadRecommendation(
                type: .increaseReps,
                weight: currentWeight,
                unit: unit,
                reps: targetReps,
                message: "\(formatWeight(currentWeight)) \(unit) × \(targetReps)",
                detail: detailMsg,
                confidence: confidence
            )
        }

        // ── Priority 5: Maintain ──
        let weakSets = workingReps.enumerated().filter { $0.element < minReps }
        let weakDetail: String
        if !weakSets.isEmpty {
            let setNumbers = weakSets.map { "set \($0.offset + 1)" }.joined(separator: ", ")
            weakDetail = "Focus on \(setNumbers) — fell short of \(minReps) reps."
        } else {
            weakDetail = "Keep pushing at this weight."
        }

        // Check if volume has been flat — suggest adding a set
        var maintainDetail = weakDetail
        if sessions.count >= 6 {
            let recentVolumes = Array(sessions.prefix(6)).map(\.totalVolume)
            let mean = recentVolumes.reduce(0, +) / Double(recentVolumes.count)
            if mean > 0 {
                let variance = recentVolumes.map { ($0 - mean) * ($0 - mean) }.reduce(0, +) / Double(recentVolumes.count)
                let cv = sqrt(variance) / mean
                if cv < 0.05 {
                    maintainDetail += " Volume has been flat — consider adding a set."
                }
            }
        }

        return OverloadRecommendation(
            type: .maintain,
            weight: currentWeight,
            unit: unit,
            reps: max(currentMinReps, minReps),
            message: "Keep \(formatWeight(currentWeight)) \(unit) × \(max(currentMinReps, minReps))",
            detail: maintainDetail,
            confidence: confidence
        )
    }

    // MARK: - Helpers

    private static func confidenceLevel(sessionCount: Int) -> RecommendationConfidence {
        if sessionCount >= 5 { return .high }
        if sessionCount >= 2 { return .medium }
        return .low
    }

    /// Check if the user's best working set reps haven't reached maxReps across N consecutive sessions at the same weight.
    /// Unlike the old hasFailedSameWeight, this compares against the target rep range top — not intra-session variation.
    private static func hasStagnatedAtWeight(sessions: [DetailedSessionSnapshot], maxReps: Int, times: Int) -> Bool {
        guard sessions.count >= times else { return false }
        let weight = sessions.first!.topWeight
        let tolerance = max(0.5, weight * 0.03)
        var stagnantCount = 0
        for session in sessions.prefix(times) {
            guard abs(session.topWeight - weight) < tolerance else { break }
            let bestReps = session.workingSetReps.max() ?? 0
            if bestReps < maxReps {
                stagnantCount += 1
            }
        }
        return stagnantCount >= times
    }

    static func roundToNearest(_ value: Double, increment: Double) -> Double {
        guard increment > 0 else { return value }
        return (value / increment).rounded() * increment
    }

    static func formatWeight(_ weight: Double) -> String {
        if weight.truncatingRemainder(dividingBy: 1) == 0 {
            return String(format: "%.0f", weight)
        }
        return String(format: "%.1f", weight)
    }
}
