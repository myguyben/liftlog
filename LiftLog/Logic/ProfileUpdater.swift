import Foundation
import SwiftData

struct ProfileUpdater {

    /// Update the exercise progress profile after completing a session.
    static func updateProfile(
        profile: ExerciseProgressProfile,
        currentSession: DetailedSessionSnapshot,
        previousSessions: [DetailedSessionSnapshot],
        template: ExerciseTemplate?,
        category: ExerciseCategory
    ) {
        let previousSession = previousSessions.first

        let currentWeight = currentSession.topWeight
        let previousWeight = previousSession?.topWeight ?? 0

        // Track weight change outcomes
        if currentWeight > previousWeight + 0.5 {
            // Weight increased
            let workingReps = currentSession.workingSetReps
            let minReps = profile.typicalMinReps
            if !workingReps.isEmpty && workingReps.allSatisfy({ $0 >= minReps }) {
                profile.successfulIncreases += 1
                profile.lastWeightIncrease = currentSession.date

                // Update average sessions to progress (EMA) — only on actual weight increase
                let currentRate = Double(profile.currentWeightSessionCount)
                profile.averageSessionsToProgress = profile.averageSessionsToProgress * 0.7 + currentRate * 0.3
            } else {
                profile.failedIncreases += 1
            }
            profile.currentWeightSessionCount = 1
        } else if abs(currentWeight - previousWeight) <= 0.5 {
            // Same weight
            profile.currentWeightSessionCount += 1
        } else {
            // Weight decreased — likely a deload
            profile.currentWeightSessionCount = 1
        }

        profile.lastWorkingWeight = currentWeight

        // Update typical rep dropoff (exponential moving average, alpha=0.3)
        let dropoff = currentSession.repDropoff
        let alpha = 0.3
        profile.typicalRepDropoff = profile.typicalRepDropoff * (1 - alpha) + dropoff * alpha

        // Update typical rep range from observed behavior — use last 3 sessions only
        // to avoid old progression data distorting the range
        let allSessions = [currentSession] + previousSessions
        let recentSessions = Array(allSessions.prefix(3))
        if recentSessions.count >= 2 {
            let allWorkingReps = recentSessions.flatMap(\.workingSetReps)
            if !allWorkingReps.isEmpty {
                let sorted = allWorkingReps.sorted()
                let p10Index = max(0, sorted.count / 10)
                let p90Index = min(sorted.count - 1, sorted.count * 9 / 10)
                profile.typicalMinReps = sorted[p10Index]
                profile.typicalMaxReps = sorted[p90Index]
            }
        }

        // Sessions since deload
        if previousWeight > 0 && currentWeight < previousWeight * 0.9 {
            // Weight dropped 10%+ → this is a deload
            profile.sessionsSinceDeload = 0
            profile.lastDeloadDate = currentSession.date
        } else {
            profile.sessionsSinceDeload += 1
        }

        // Update plateau tracking
        if profile.lastWeightIncrease != nil {
            let sessionsSinceIncrease = profile.currentWeightSessionCount
            profile.longestPlateauSessions = max(profile.longestPlateauSessions, sessionsSinceIncrease)
        }

        // Resolve category from template and cache it
        profile.resolvedCategory = ExerciseCategory.classify(name: profile.exerciseName, template: template).rawValue

        profile.lastUpdated = .now
    }
}
