import SwiftUI

struct StyleStepView: View {
    @EnvironmentObject var authVM: AuthViewModel
    let prompt: String
    let selectedModel: ImageGenerationModel
    @Binding var selectedStyle: ImageStyle
    let onGenerated: (Data) -> Void

    @State private var isGenerating = false
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Pick a style")
                                .font(.title2.bold())
                                .foregroundColor(.white)
                            Text("Style adds artistic direction to your prompt")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.45))
                        }
                        .padding(.top, 24)

                        // Style grid
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                            ForEach(availableStyles) { style in
                                StyleChip(style: style, isSelected: selectedStyle.id == style.id) {
                                    selectedStyle = style
                                }
                            }
                        }

                        // Summary card
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Summary")
                                .font(.caption.weight(.semibold))
                                .foregroundColor(.white.opacity(0.5))
                                .textCase(.uppercase)
                                .tracking(0.8)

                            HStack {
                                Label(selectedModel.name, systemImage: "cpu")
                                Spacer()
                                Label(selectedStyle.label, systemImage: "paintpalette")
                            }
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.75))
                        }
                        .padding(16)
                        .cardStyle()

                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red.opacity(0.85))
                                .multilineTextAlignment(.center)
                        }

                        Spacer(minLength: 120)
                    }
                    .padding(.horizontal, 24)
                }

                generateButton
            }
        }
        .navigationTitle("Step 3 of 3")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    private var generateButton: some View {
        Button {
            Task { await generate() }
        } label: {
            HStack(spacing: 10) {
                if isGenerating {
                    ProgressView().tint(.white)
                    Text("Generating…")
                        .fontWeight(.semibold)
                } else {
                    Image(systemName: "sparkles")
                    Text("Generate Image")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(isGenerating ? AnyShapeStyle(Color.white.opacity(0.15)) : AnyShapeStyle(LinearGradient.appGradient))
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .disabled(isGenerating)
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
        .background(
            LinearGradient(colors: [Color.appBackground.opacity(0), Color.appBackground],
                           startPoint: .top, endPoint: .bottom)
            .ignoresSafeArea()
        )
    }

    private func generate() async {
        guard let token = await authVM.getValidToken() else {
            errorMessage = "Not authenticated. Please sign in again."
            return
        }
        isGenerating = true
        errorMessage = nil
        defer { isGenerating = false }
        do {
            let imageData = try await AgnicImageService.shared.generateImage(
                prompt: prompt,
                modelId: selectedModel.id,
                style: selectedStyle,
                accessToken: token
            )
            onGenerated(imageData)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

private struct StyleChip: View {
    let style: ImageStyle
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(style.label)
                .font(.caption.weight(.medium))
                .lineLimit(1)
                .minimumScaleFactor(0.8)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity)
                .background(isSelected ? Color.appAccent.opacity(0.2) : Color.appCard)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(isSelected ? Color.appAccent : Color.appBorder, lineWidth: 1)
                )
                .foregroundColor(isSelected ? Color(hex: "#C4B5FD") : .white.opacity(0.7))
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
    }
}
