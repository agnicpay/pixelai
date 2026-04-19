import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }

    // App palette
    static let appBackground  = Color(hex: "#0D0D1F")
    static let appCard        = Color.white.opacity(0.07)
    static let appBorder      = Color.white.opacity(0.12)
    static let appAccent      = Color(hex: "#8B3CF7")
    static let appAccent2     = Color(hex: "#CC2E8F")
}

extension LinearGradient {
    static let appGradient = LinearGradient(
        colors: [Color(hex: "#7C3AED"), Color(hex: "#C026A4")],
        startPoint: .leading, endPoint: .trailing
    )
}

extension View {
    func cardStyle() -> some View {
        self
            .background(Color.appCard)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.appBorder, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
