import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            // Ambient glow orbs
            Circle()
                .fill(Color(hex: "#6D28D9").opacity(0.35))
                .frame(width: 320, height: 320)
                .blur(radius: 90)
                .offset(x: -80, y: -220)

            Circle()
                .fill(Color(hex: "#9D174D").opacity(0.25))
                .frame(width: 260, height: 260)
                .blur(radius: 90)
                .offset(x: 110, y: 120)

            VStack(spacing: 0) {
                Spacer()

                // Logo
                VStack(spacing: 14) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 52, weight: .light))
                        .foregroundStyle(LinearGradient.appGradient)

                    Text("Dreamt")
                        .font(.system(size: 44, weight: .bold))
                        .foregroundStyle(LinearGradient.appGradient)

                    Text("Generate stunning images with AI")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.45))
                        .multilineTextAlignment(.center)
                }

                Spacer()

                // Sign-in section
                VStack(spacing: 14) {
                    if let error = authVM.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red.opacity(0.9))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }

                    Button {
                        Task { await authVM.login() }
                    } label: {
                        HStack(spacing: 10) {
                            if authVM.isLoading {
                                ProgressView().tint(.white).scaleEffect(0.85)
                            } else {
                                Image(systemName: "wallet.pass.fill")
                            }
                            Text(authVM.isLoading ? "Signing in…" : "Continue with Agnic")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .background(LinearGradient.appGradient)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .disabled(authVM.isLoading)

                    Text("You'll be redirected to Agnic to sign in securely.")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.3))
                        .multilineTextAlignment(.center)
                }
                .padding(.bottom, 56)
            }
            .padding(.horizontal, 32)
        }
    }
}
