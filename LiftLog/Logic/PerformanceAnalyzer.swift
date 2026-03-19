import Foundation

// MARK: - Detailed Session Data

struct SetSnapshot {
    var setNumber: Int
    var weight: Double
    var reps: Int
    var rpe: Double?
    var isCompleted: Bool
}

struct DetailedSessionSnapshot {
    var sets: [SetSnapshot]
    var date: Date
    var unit: String

    // MARK: - Computed Properties

    /// Working sets: sets at the most-common heavy weight (mode of weights within 10% of max).
    /// This filters out warm-ups while correctly handling multiple sets at a working weight.
    var workingSets: [SetSnapshot] {
        let completed = sets.filter(\.isCompleted)
        guard let maxWeight = completed.map(\.weight).max(), maxWeight > 0 else {
            return completed
        }
        let threshold = maxWeight * 0.90
        let heavySets = completed.filter { $0.weight >= threshold }
        // Find the mode weight among heavy sets
        var weightCounts: [Double: Int] = [:]
        for s in heavySets {
            let rounded = (s.weight * 100).rounded() / 100
            weightCounts[rounded, default: 0] += 1
        }
        guard let modeWeight = weightCounts.max(by: { $0.value < $1.value })?.key else {
            return heavySets
        }
        // Return sets at the mode weight (within small tolerance)
        return heavySets.filter { abs($0.weight - modeWeight) < 0.01 }
    }

    var topWeight: Double {
        sets.map(\.weight).max() ?? 0
    }

    var totalVolume: Double {
        sets.filter(\.isCompleted).reduce(0) { $0 + $1.weight * Double($1.reps) }
    }

    /// % decline from first working set reps to the worst working set reps
    var repDropoff: Double {
        let ws = workingSets
        guard let first = ws.first, first.reps > 0, ws.count > 1 else { return 0 }
        let minReps = ws.map(\.reps).min()!
        return max(0, Double(first.reps - minReps) / Double(first.reps))
    }

    var averageRPE: Double? {
        let rpes = sets.compactMap(\.rpe)
        guard !rpes.isEmpty else { return nil }
        return rpes.reduce(0, +) / Double(rpes.count)
    }

    var completedSetCount: Int {
        sets.filter(\.isCompleted).count
    }

    var workingSetReps: [Int] {
        workingSets.map(\.reps)
    }
}

// MARK: - Analysis Types

enum VolumeTrend {
    case increasing(magnitude: Double)
    case stable
    case decreasing(magnitude: Double)
}

struct FatigueSignal {
    var score: Double // 0-100
    var factors: [String] // human-readable factor descriptions
}

enum PlateauStrategy: String {
    case microload
    case repExpansion
    case deloadAndRebuild
    case volumeAdjustment
}

struct PlateauStatus {
    var isPlateaued: Bool
    var sessionsStuck: Int
    var suggestedStrategy: PlateauStrategy?
}

struct RepRangePosition {
    var position: Double // 0.0 = bottom of range, 1.0 = top
    var readyToGraduate: Bool
}

// MARK: - Performance Analyzer

struct PerformanceAnalyzer {

    /// Analyze volume trend over last 4 sessions — compare mean of newer half vs older half
    static func analyzeVolumeTrend(sessions: [DetailedSessionSnapshot]) -> VolumeTrend {
        let window = Array(sessions.prefix(4))
        guard window.count >= 2 else { return .stable }

        let volumes = window.map(\.totalVolume)
        // Sessions are newest-first
        let midpoint = volumes.count / 2
        let newerHalf = volumes.prefix(midpoint)
        let olderHalf = volumes.suffix(from: midpoint)

        let newerMean = newerHalf.reduce(0, +) / Double(newerHalf.count)
        let olderMean = olderHalf.reduce(0, +) / Double(olderHalf.count)
        guard olderMean > 0 else { return .stable }

        let change = (newerMean - olderMean) / olderMean
        if change > 0.05 {
            return .increasing(magnitude: change)
        } else if change < -0.05 {
            return .decreasing(magnitude: abs(change))
        }
        return .stable
    }

    /// Composite fatigue score 0-100
    static func analyzeFatigue(sessions: [DetailedSessionSnapshot], profile: ExerciseProgressProfile?) -> FatigueSignal {
        guard let latest = sessions.first else {
            return FatigueSignal(score: 0, factors: [])
        }

        var score: Double = 0
        var factors: [String] = []

        // Factor 1: Rep dropoff vs typical (0-30 points)
        let typicalDropoff = profile?.typicalRepDropoff ?? 0.1
        let currentDropoff = latest.repDropoff
        if typicalDropoff > 0 && currentDropoff > typicalDropoff * 1.5 {
            let dropoffScore = min(30, (currentDropoff - typicalDropoff) / typicalDropoff * 30)
            score += dropoffScore
            factors.append("Rep dropoff higher than usual")
        }

        // Factor 2: RPE escalation at same weight (0-25 points)
        if sessions.count >= 2 {
            let currentRPE = latest.averageRPE
            let previousRPE = sessions[1].averageRPE
            if let curr = currentRPE, let prev = previousRPE,
               abs(latest.topWeight - sessions[1].topWeight) < max(0.5, latest.topWeight * 0.03),
               curr > prev {
                let rpeIncrease = curr - prev
                let rpeScore = min(25, rpeIncrease * 12.5)
                score += rpeScore
                factors.append("RPE increasing at same weight")
            }
        }

        // Factor 3: Performance variance / coefficient of variation (0-15 points, threshold 0.20)
        if sessions.count >= 3 {
            let recentVolumes = Array(sessions.prefix(4)).map(\.totalVolume)
            let mean = recentVolumes.reduce(0, +) / Double(recentVolumes.count)
            if mean > 0 {
                let variance = recentVolumes.map { ($0 - mean) * ($0 - mean) }.reduce(0, +) / Double(recentVolumes.count)
                let cv = sqrt(variance) / mean
                if cv > 0.20 {
                    let cvScore = min(15, (cv - 0.20) * 75)
                    score += cvScore
                    factors.append("Inconsistent performance")
                }
            }
        }

        // Factor 4: Sessions since deload (0-20 points, threshold raised to 16)
        let sessionsSinceDeload = profile?.sessionsSinceDeload ?? sessions.count
        if sessionsSinceDeload > 16 {
            let deloadScore = min(20, Double(sessionsSinceDeload - 16) * 4)
            score += deloadScore
            factors.append("\(sessionsSinceDeload) sessions since last deload")
        }

        return FatigueSignal(score: min(100, score), factors: factors)
    }

    /// Detect if user is plateaued and suggest a strategy
    static func detectPlateau(sessions: [DetailedSessionSnapshot], profile: ExerciseProgressProfile?) -> PlateauStatus {
        guard sessions.count >= 2 else {
            return PlateauStatus(isPlateaued: false, sessionsStuck: 0, suggestedStrategy: nil)
        }

        // Count sessions at same top weight — use relative tolerance
        let currentWeight = sessions.first!.topWeight
        let tolerance = max(0.5, currentWeight * 0.03)
        var sessionsAtWeight = 0
        for session in sessions {
            if abs(session.topWeight - currentWeight) < tolerance {
                sessionsAtWeight += 1
            } else {
                break
            }
        }

        let isPlateaued = sessionsAtWeight >= 4
        guard isPlateaued else {
            return PlateauStatus(isPlateaued: false, sessionsStuck: sessionsAtWeight, suggestedStrategy: nil)
        }

        // Choose strategy based on profile
        let failureRate: Double
        if let p = profile, (p.successfulIncreases + p.failedIncreases) > 0 {
            failureRate = Double(p.failedIncreases) / Double(p.successfulIncreases + p.failedIncreases)
        } else {
            failureRate = 0.5
        }

        let strategy: PlateauStrategy
        if failureRate > 0.5 {
            strategy = .microload
        } else if sessionsAtWeight <= 6 {
            strategy = .repExpansion
        } else {
            strategy = .deloadAndRebuild
        }

        return PlateauStatus(isPlateaued: true, sessionsStuck: sessionsAtWeight, suggestedStrategy: strategy)
    }

    /// Where user sits within their target rep range
    static func detectRepRangePosition(sessions: [DetailedSessionSnapshot], profile: ExerciseProgressProfile?) -> RepRangePosition {
        guard let latest = sessions.first else {
            return RepRangePosition(position: 0.5, readyToGraduate: false)
        }

        let minReps = profile?.typicalMinReps ?? 6
        let maxReps = profile?.typicalMaxReps ?? 12

        let workingReps = latest.workingSetReps
        guard !workingReps.isEmpty else {
            return RepRangePosition(position: 0.5, readyToGraduate: false)
        }

        let minInSession = workingReps.min()!
        let rangeSize = max(1, maxReps - minReps)
        let position = Double(minInSession - minReps) / Double(rangeSize)
        let clampedPosition = max(0, min(1, position))

        // Ready to graduate: all working sets hit top of rep range
        let readyToGraduate = workingReps.allSatisfy { $0 >= maxReps }

        return RepRangePosition(position: clampedPosition, readyToGraduate: readyToGraduate)
    }
}
