import SwiftUI

enum CreationRoute: Hashable { case model, style, result }

struct CreationFlowView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @State private var prompt          = ""
    @State private var selectedModel   = defaultModel
    @State private var selectedStyle   = availableStyles[0]
    @State private var navigationPath: [CreationRoute] = []
    @State private var generatedImageData: Data?

    var body: some View {
        NavigationStack(path: $navigationPath) {
            PromptStepView(
                prompt: $prompt,
                balance: authVM.balance,
                onNext: { navigationPath.append(.model) }
            )
            .navigationDestination(for: CreationRoute.self) { route in
                switch route {
                case .model:
                    ModelStepView(
                        selectedModel: $selectedModel,
                        onNext: { navigationPath.append(.style) }
                    )
                case .style:
                    StyleStepView(
                        prompt: prompt,
                        selectedModel: selectedModel,
                        selectedStyle: $selectedStyle,
                        onGenerated: { imageData in
                            generatedImageData = imageData
                            navigationPath.append(.result)
                            Task { await authVM.refreshBalance() }
                        }
                    )
                case .result:
                    if let data = generatedImageData {
                        ResultView(
                            imageData: data,
                            prompt: prompt,
                            model: selectedModel,
                            style: selectedStyle,
                            onCreateAnother: {
                                navigationPath = []
                                prompt = ""
                                selectedStyle = availableStyles[0]
                                generatedImageData = nil
                            }
                        )
                    }
                }
            }
        }
        .tint(.white)
    }
}
