import SwiftUI

// MARK: - Theme Colors

extension Color {
    /// Pure black background — #000000
    static let background = Color(red: 0, green: 0, blue: 0)

    /// Card surface — #1C1C1E
    static let card = Color(white: 0.11)

    /// Elevated surface — #2C2C2E
    static let elevated = Color(white: 0.17)

    /// Accent yellow — #FFD60A
    static let accent = Color(red: 1, green: 0.84, blue: 0.04)

    /// Primary text — white
    static let textPrimary = Color.white

    /// Secondary text — slightly muted white
    static let textSecondary = Color(white: 0.92).opacity(0.8)

    /// Muted gray — #8E8E93
    static let muted = Color.gray

    /// Divider line — #38383A
    static let divider = Color(white: 0.22)

    /// Success green — #30D158
    static let success = Color(red: 0.19, green: 0.82, blue: 0.35)

    /// Danger red — #FF453A
    static let danger = Color(red: 1, green: 0.27, blue: 0.23)
}

// MARK: - Card Style Modifier

struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(14)
            .background(Color.card)
            .cornerRadius(13)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardStyle())
    }
}

// MARK: - Elevated Card Style

struct ElevatedCardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(14)
            .background(Color.elevated)
            .cornerRadius(13)
    }
}

extension View {
    func elevatedCardStyle() -> some View {
        modifier(ElevatedCardStyle())
    }
}
