import SwiftUI

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var balance: AgnicBalance?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let auth = AgnicAuthService.shared

    init() {
        if let tokens = auth.loadTokens(), !tokens.isExpired {
            isAuthenticated = true
            Task { await refreshBalance() }
        }
    }

    // MARK: - Token access

    func getValidToken() async -> String? {
        try? await auth.validAccessToken()
    }

    // MARK: - Login / Logout

    func login() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let tokens = try await auth.login()
            isAuthenticated = true
            let bal = await auth.fetchBalance(accessToken: tokens.accessToken)
            balance = bal
        } catch AgnicError.cancelled {
            // User dismissed — not an error
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func logout() {
        auth.logout()
        isAuthenticated = false
        balance = nil
    }

    // MARK: - Balance

    func refreshBalance() async {
        guard let token = await getValidToken() else {
            logout()
            return
        }
        balance = await auth.fetchBalance(accessToken: token)
    }
}
