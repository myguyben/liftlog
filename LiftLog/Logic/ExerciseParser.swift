import Foundation

struct ParsedExercise {
    var name: String
    var weight: Double?
    var unit: String
    var reps: Int?
    var sets: Int?
    var confidence: Double

    init(name: String = "", weight: Double? = nil, unit: String = "lbs", reps: Int? = nil, sets: Int? = nil, confidence: Double = 0.0) {
        self.name = name
        self.weight = weight
        self.unit = unit
        self.reps = reps
        self.sets = sets
        self.confidence = confidence
    }
}

struct ExerciseParser {

    // MARK: - Regex patterns

    /// Compact format: 3x10x135, 3x10x135lbs, 3x10x60kg
    private static let compactPattern = #"(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*([\d.]+)\s*(lbs?|pounds?|kg|kgs?|kilograms?|#)?"#

    /// Weight with unit: 135lbs, 60kg, 225#, 135 lbs, 100 pounds
    private static let weightPattern = #"([\d.]+)\s*(lbs?|pounds?|kg|kgs?|kilograms?|#)"#

    /// Reps: 10 reps, x12, x 8
    private static let repsPattern = #"(?:(\d+)\s*reps|[xX]\s*(\d+))"#

    /// Sets: 3 sets, 5sets
    private static let setsPattern = #"(\d+)\s*sets?"#

    /// Two bare numbers: "100 10" or "100, 10" -> weight reps
    private static let twoNumbersPattern = #"([\d.]+)\s*[,\s]\s*(\d+)\s*$"#

    /// Standalone number (fallback for reps)
    private static let standaloneNumberPattern = #"(?<!\d)(\d{1,3})(?!\d)"#

    // MARK: - Public API

    static func parse(_ input: String) -> ParsedExercise {
        let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return ParsedExercise()
        }

        var result = ParsedExercise()
        var remaining = trimmed
        var confidence = 0.0

        // 0. Check for "Name 100 10" pattern (two trailing numbers = weight reps)
        if result.weight == nil, let match = firstMatch(for: #"^(.+?)\s+([\d.]+)\s+(\d+)\s*$"#, in: remaining) {
            let nameStr = substring(of: remaining, range: match.range(at: 1))
            let weightStr = substring(of: remaining, range: match.range(at: 2))
            let repsStr = substring(of: remaining, range: match.range(at: 3))

            if let name = nameStr, let w = Double(weightStr ?? ""), let r = Int(repsStr ?? "") {
                // Only match if the name part has letters (not just numbers)
                if name.rangeOfCharacter(from: .letters) != nil {
                    result.name = cleanName(name)
                    result.weight = w
                    result.reps = r
                    result.confidence = 0.7
                    return result
                }
            }
        }

        // 1. Try compact format first: 3x10x135
        if let match = firstMatch(for: compactPattern, in: remaining) {
            let setsStr = substring(of: remaining, range: match.range(at: 1))
            let repsStr = substring(of: remaining, range: match.range(at: 2))
            let weightStr = substring(of: remaining, range: match.range(at: 3))

            result.sets = Int(setsStr ?? "")
            result.reps = Int(repsStr ?? "")
            result.weight = Double(weightStr ?? "")

            if let unitStr = substring(of: remaining, range: match.range(at: 4)) {
                result.unit = normalizeUnit(unitStr)
            }

            remaining = removeMatch(match, from: remaining)
            confidence += 0.5
        } else {
            // 2. Parse weight
            if let match = firstMatch(for: weightPattern, in: remaining) {
                let weightStr = substring(of: remaining, range: match.range(at: 1))
                let unitStr = substring(of: remaining, range: match.range(at: 2))

                result.weight = Double(weightStr ?? "")
                if let u = unitStr {
                    result.unit = normalizeUnit(u)
                }

                remaining = removeMatch(match, from: remaining)
                confidence += 0.2
            }

            // 3. Parse sets
            if let match = firstMatch(for: setsPattern, in: remaining) {
                let setsStr = substring(of: remaining, range: match.range(at: 1))
                result.sets = Int(setsStr ?? "")
                remaining = removeMatch(match, from: remaining)
                confidence += 0.15
            }

            // 4. Parse reps
            if let match = firstMatch(for: repsPattern, in: remaining) {
                let repsStr1 = substring(of: remaining, range: match.range(at: 1))
                let repsStr2 = substring(of: remaining, range: match.range(at: 2))
                result.reps = Int(repsStr1 ?? "") ?? Int(repsStr2 ?? "")
                remaining = removeMatch(match, from: remaining)
                confidence += 0.15
            }
        }

        // 5. Extract exercise name from remaining text
        let name = cleanName(remaining)
        if !name.isEmpty {
            result.name = name
            confidence += 0.3
        }

        // If we only got a name with no numeric data, lower confidence
        if result.weight == nil && result.reps == nil && result.sets == nil {
            confidence = min(confidence, 0.3)
        }

        result.confidence = min(confidence, 1.0)
        return result
    }

    // MARK: - Helpers

    private static func normalizeUnit(_ raw: String) -> String {
        let lower = raw.lowercased()
        if lower == "kg" || lower == "kgs" || lower.hasPrefix("kilogram") {
            return "kg"
        }
        return "lbs"  // lbs, lb, pounds, #
    }

    private static func firstMatch(for pattern: String, in text: String) -> NSTextCheckingResult? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else {
            return nil
        }
        let range = NSRange(text.startIndex..., in: text)
        return regex.firstMatch(in: text, options: [], range: range)
    }

    private static func substring(of text: String, range: NSRange) -> String? {
        guard range.location != NSNotFound, let swiftRange = Range(range, in: text) else {
            return nil
        }
        return String(text[swiftRange])
    }

    private static func removeMatch(_ match: NSTextCheckingResult, from text: String) -> String {
        guard let swiftRange = Range(match.range, in: text) else {
            return text
        }
        return text.replacingCharacters(in: swiftRange, with: " ")
    }

    private static func cleanName(_ raw: String) -> String {
        // Remove stray digits, punctuation artifacts, and extra whitespace
        var cleaned = raw

        // Remove isolated single/double digit numbers that are likely leftover from parsing
        if let regex = try? NSRegularExpression(pattern: #"(?<![a-zA-Z])(\d{1,2})(?![a-zA-Z\d])"#) {
            let range = NSRange(cleaned.startIndex..., in: cleaned)
            cleaned = regex.stringByReplacingMatches(in: cleaned, range: range, withTemplate: "")
        }

        // Remove common separators left behind
        cleaned = cleaned.replacingOccurrences(of: "  ", with: " ")
        cleaned = cleaned.trimmingCharacters(in: .whitespacesAndNewlines)
        cleaned = cleaned.trimmingCharacters(in: CharacterSet(charactersIn: "-:,xX@# "))

        // Title-case the name
        if !cleaned.isEmpty {
            cleaned = cleaned.split(separator: " ")
                .map { word in
                    let lower = word.lowercased()
                    // Keep short prepositions lowercase unless first word
                    if ["of", "the", "and", "or", "with", "to"].contains(lower) {
                        return lower
                    }
                    return word.prefix(1).uppercased() + word.dropFirst().lowercased()
                }
                .joined(separator: " ")

            // Capitalize the first letter regardless
            if let first = cleaned.first {
                cleaned = first.uppercased() + cleaned.dropFirst()
            }
        }

        return cleaned
    }
}
