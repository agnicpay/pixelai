import SwiftUI

struct PromptStepView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @Binding var prompt: String
    let balance: AgnicBalance?
    let onNext: () -> Void

    @State private var isEnhancing = false
    @State private var errorMessage: String?
    @FocusState private var isFocused: Bool

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    // Header
                    VStack(alignment: .leading, spacing: 6) {
                        Text("What do you want to create?")
                            .font(.title2.bold())
                            .foregroundColor(.white)
                        Text("Describe your image in detail")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.45))
                    }

                    // Prompt text area
                    VStack(alignment: .trailing, spacing: 8) {
                        ZStack(alignment: .topLeading) {
                            if prompt.isEmpty {
                                Text("A serene mountain lake at golden hour, mist rolling across the water, pine trees reflected…")
                                    .foregroundColor(.white.opacity(0.25))
                                    .font(.body)
                                    .padding(.top, 2)
                                    .allowsHitTesting(false)
                            }
                            TextEditor(text: $prompt)
                                .focused($isFocused)
                                .font(.body)
                                .foregroundColor(.white)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 140)
                        }
                        .padding(16)
                        .cardStyle()

                        Text("\(prompt.count) characters")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.3))
                    }

                    // Enhance button
                    Button {
                        Task { await enhance() }
                    } label: {
                        HStack(spacing: 8) {
                            if isEnhancing {
                                ProgressView().tint(.white).scaleEffect(0.8)
                            } else {
                                Image(systemName: "wand.and.sparkles")
                            }
                            Text(isEnhancing ? "Enhancing…" : "Enhance with AI")
                                .fontWeight(.medium)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .background(Color.white.opacity(0.08))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.white.opacity(0.15), lineWidth: 1))
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(prompt.trimmingCharacters(in: .whitespaces).isEmpty || isEnhancing)

                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red.opacity(0.85))
                    }

                    Spacer(minLength: 32)
                }
                .padding(.horizontal, 24)
                .padding(.top, 24)
            }

            // Next button pinned at bottom
            VStack {
                Spacer()
                nextButton
            }
        }
        .navigationTitle("Step 1 of 3")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                if let bal = balance {
                    Text(bal.displayUSD)
                        .font(.caption.monospacedDigit())
                        .foregroundColor(.white.opacity(0.6))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.08))
                        .clipShape(Capsule())
                }
            }
        }
        .onAppear { isFocused = true }
    }

    private var nextButton: some View {
        Button(action: onNext) {
            HStack {
                Text("Choose Model")
                Image(systemName: "arrow.right")
            }
            .fontWeight(.semibold)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(prompt.trimmingCharacters(in: .whitespaces).isEmpty
                ? LinearGradient(colors: [Color.white.opacity(0.2)], startPoint: .leading, endPoint: .trailing)
                : LinearGradient.appGradient)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .disabled(prompt.trimmingCharacters(in: .whitespaces).isEmpty)
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
        .background(
            LinearGradient(colors: [Color.appBackground.opacity(0), Color.appBackground],
                           startPoint: .top, endPoint: .bottom)
            .ignoresSafeArea()
        )
    }

    private func enhance() async {
        guard let token = await authVM.getValidToken() else { return }
        isEnhancing = true
        errorMessage = nil
        defer { isEnhancing = false }
        do {
            prompt = try await AgnicImageService.shared.enhancePrompt(prompt, accessToken: token)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
