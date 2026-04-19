import SwiftUI

struct ModelStepView: View {
    @Binding var selectedModel: ImageGenerationModel
    let onNext: () -> Void

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Choose a model")
                                .font(.title2.bold())
                                .foregroundColor(.white)
                            Text("Each model has different strengths and costs")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.45))
                        }
                        .padding(.top, 24)

                        ForEach(availableModels) { model in
                            ModelCard(model: model, isSelected: selectedModel.id == model.id) {
                                selectedModel = model
                            }
                        }

                        Spacer(minLength: 100)
                    }
                    .padding(.horizontal, 24)
                }

                nextButton
            }
        }
        .navigationTitle("Step 2 of 3")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    private var nextButton: some View {
        Button(action: onNext) {
            HStack {
                Text("Choose Style")
                Image(systemName: "arrow.right")
            }
            .fontWeight(.semibold)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(LinearGradient.appGradient)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
        .background(
            LinearGradient(colors: [Color.appBackground.opacity(0), Color.appBackground],
                           startPoint: .top, endPoint: .bottom)
            .ignoresSafeArea()
        )
    }
}

private struct ModelCard: View {
    let model: ImageGenerationModel
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                // Selection indicator
                ZStack {
                    Circle()
                        .stroke(isSelected ? Color.appAccent : Color.white.opacity(0.2), lineWidth: 2)
                        .frame(width: 22, height: 22)
                    if isSelected {
                        Circle()
                            .fill(Color.appAccent)
                            .frame(width: 12, height: 12)
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(model.name)
                            .font(.headline)
                            .foregroundColor(.white)
                        if let tag = model.tag {
                            Text(tag)
                                .font(.caption2.weight(.semibold))
                                .foregroundColor(Color(hex: "#A78BFA"))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color(hex: "#4C1D95").opacity(0.6))
                                .clipShape(Capsule())
                        }
                    }
                    Text("\(model.formattedCost) / image")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.5))
                }

                Spacer()
            }
            .padding(16)
            .background(isSelected ? Color.appAccent.opacity(0.12) : Color.appCard)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? Color.appAccent.opacity(0.6) : Color.appBorder, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }
}
