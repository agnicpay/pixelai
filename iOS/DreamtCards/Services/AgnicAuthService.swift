import Foundation
import AuthenticationServices
import CryptoKit
import UIKit

// MARK: - Token model

struct AgnicTokens: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: TimeInterval   // absolute timestamp

    var isExpired: Bool { Date().timeIntervalSince1970 > expiresAt - 60 }
}

// MARK: - Balance model

struct AgnicBalance {
    let total: Double             // usdc + credit
    var displayUSD: String { String(format: "$%.4f", total) }
}

// MARK: - Errors

enum AgnicError: LocalizedError {
    case cancelled
    case invalidCallback
    case tokenExchangeFailed(String)
    case refreshFailed

    var errorDescription: String? {
        switch self {
        case .cancelled:                      return "Login was cancelled."
        case .invalidCallback:                return "Invalid OAuth callback."
        case .tokenExchangeFailed(let msg):   return "Token exchange failed: \(msg)"
        case .refreshFailed:                  return "Session expired. Please log in again."
        }
    }
}

// MARK: - AgnicAuthService

final class AgnicAuthService: NSObject {
    static let shared = AgnicAuthService()

    private let agnicAuthURL    = "https://api.agnic.ai/oauth/authorize"
    private let agnicTokenURL   = "https://api.agnic.ai/oauth/token"
    private let agnicBalanceURL = "https://api.agnic.ai/api/balance?network=base"
    private let clientId        = "pixelai"
    private let redirectURI     = "dreamtcards://callback"
    private let storageKey      = "dreamt_agnic_tokens_v1"

    private var authSession: ASWebAuthenticationSession?

    private override init() {}

    // MARK: - Token persistence (UserDefaults)

    func loadTokens() -> AgnicTokens? {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return nil }
        return try? JSONDecoder().decode(AgnicTokens.self, from: data)
    }

    func saveTokens(_ tokens: AgnicTokens) {
        if let data = try? JSONEncoder().encode(tokens) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    func clearTokens() {
        UserDefaults.standard.removeObject(forKey: storageKey)
    }

    // MARK: - PKCE helpers

    private func generateCodeVerifier() -> String {
        var bytes = [UInt8](repeating: 0, count: 64)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    private func generateCodeChallenge(verifier: String) -> String {
        let hash = SHA256.hash(data: Data(verifier.utf8))
        return Data(hash).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    // MARK: - Login (OAuth PKCE)

    @MainActor
    func login() async throws -> AgnicTokens {
        let codeVerifier  = generateCodeVerifier()
        let codeChallenge = generateCodeChallenge(verifier: codeVerifier)
        let state         = generateCodeVerifier()

        var components = URLComponents(string: agnicAuthURL)!
        components.queryItems = [
            URLQueryItem(name: "client_id",             value: clientId),
            URLQueryItem(name: "redirect_uri",          value: redirectURI),
            URLQueryItem(name: "state",                 value: state),
            URLQueryItem(name: "scope",                 value: "payments:sign balance:read"),
            URLQueryItem(name: "response_type",         value: "code"),
            URLQueryItem(name: "code_challenge",        value: codeChallenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
        ]
        guard let authURL = components.url else { throw AgnicError.invalidCallback }

        let callbackURL: URL = try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(
                url: authURL,
                callbackURLScheme: "dreamtcards"
            ) { url, error in
                if let error {
                    let nsErr = error as NSError
                    if nsErr.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                        continuation.resume(throwing: AgnicError.cancelled)
                    } else {
                        continuation.resume(throwing: error)
                    }
                } else if let url {
                    continuation.resume(returning: url)
                } else {
                    continuation.resume(throwing: AgnicError.invalidCallback)
                }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            self.authSession = session
            session.start()
        }

        let callbackComponents = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)
        guard let code = callbackComponents?.queryItems?.first(where: { $0.name == "code" })?.value else {
            throw AgnicError.invalidCallback
        }

        let tokens = try await exchangeCode(code, codeVerifier: codeVerifier)
        saveTokens(tokens)
        return tokens
    }

    // MARK: - Token exchange

    private func exchangeCode(_ code: String, codeVerifier: String) async throws -> AgnicTokens {
        let body: [String: Any] = [
            "grant_type":    "authorization_code",
            "code":          code,
            "redirect_uri":  redirectURI,
            "client_id":     clientId,
            "code_verifier": codeVerifier,
        ]
        var request = URLRequest(url: URL(string: agnicTokenURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            let raw = String(data: data, encoding: .utf8) ?? "(unreadable)"
            throw AgnicError.tokenExchangeFailed(raw)
        }
        return try parseTokenResponse(data)
    }

    // MARK: - Token refresh

    func refreshTokens(refreshToken: String) async throws -> AgnicTokens {
        let body: [String: Any] = [
            "grant_type":    "refresh_token",
            "refresh_token": refreshToken,
            "client_id":     clientId,
        ]
        var request = URLRequest(url: URL(string: agnicTokenURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw AgnicError.refreshFailed
        }
        let tokens = try parseTokenResponse(data)
        saveTokens(tokens)
        return tokens
    }

    // MARK: - Get valid token (auto-refresh)

    func validAccessToken() async throws -> String {
        guard var tokens = loadTokens() else { throw AgnicError.refreshFailed }
        if tokens.isExpired {
            tokens = try await refreshTokens(refreshToken: tokens.refreshToken)
        }
        return tokens.accessToken
    }

    // MARK: - Balance

    func fetchBalance(accessToken: String) async -> AgnicBalance? {
        var request = URLRequest(url: URL(string: agnicBalanceURL)!)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return nil }

        let usdc   = parseDouble(json["usdcBalance"])   ?? 0
        let credit = parseDouble(json["creditBalance"]) ?? 0
        return AgnicBalance(total: usdc + credit)
    }

    private func parseDouble(_ value: Any?) -> Double? {
        if let d = value as? Double { return d }
        if let s = value as? String { return Double(s) }
        return nil
    }

    // MARK: - Logout

    func logout() { clearTokens() }

    // MARK: - Helpers

    private func parseTokenResponse(_ data: Data) throws -> AgnicTokens {
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let accessToken  = json["access_token"]  as? String,
              let refreshToken = json["refresh_token"] as? String
        else { throw AgnicError.tokenExchangeFailed("Could not parse token response") }

        let expiresIn = (json["expires_in"] as? Double) ?? 2_592_000
        let expiresAt = Date().timeIntervalSince1970 + expiresIn
        return AgnicTokens(accessToken: accessToken, refreshToken: refreshToken, expiresAt: expiresAt)
    }
}

// MARK: - ASWebAuthenticationPresentationContextProviding

extension AgnicAuthService: ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }
            ?? ASPresentationAnchor()
    }
}
