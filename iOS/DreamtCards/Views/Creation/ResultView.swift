import SwiftUI

struct ResultView: View {
    @EnvironmentObject var galleryStore: GalleryStore
    let imageData: Data
    let prompt: String
    let model: ImageGenerationModel
    let style: ImageStyle
    let onCreateAnother: () -> Void

    @State private var isSaved = false
    @State private var showShareSheet = false
    private var uiImage: UIImage? { UIImage(data: imageData) }

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Generated image
                    if let image = uiImage {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFit()
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.appBorder, lineWidth: 1))
                            .padding(.top, 8)
                    }

                    // Meta info
                    VStack(alignment: .leading, spacing: 12) {
                        Text(prompt)
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.75))
                            .fixedSize(horizontal: false, vertical: true)

                        HStack(spacing: 12) {
                            Label(model.name, systemImage: "cpu")
                            if style.id != "none" {
                                Label(style.label, systemImage: "paintpalette")
                            }
                        }
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.4))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .cardStyle()

                    // Actions
                    VStack(spacing: 12) {
                        // Save to Gallery
                        Button {
                            saveToGallery()
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: isSaved ? "checkmark.circle.fill" : "square.and.arrow.down")
                                Text(isSaved ? "Saved to Gallery" : "Save to Gallery")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(isSaved ? AnyShapeStyle(Color.green.opacity(0.2)) : AnyShapeStyle(LinearGradient.appGradient))
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }
                        .disabled(isSaved)

                        HStack(spacing: 12) {
                            // Share
                            if let image = uiImage {
                                ShareLink(item: Image(uiImage: image), preview: SharePreview(prompt, image: Image(uiImage: image))) {
                                    HStack(spacing: 6) {
                                        Image(systemName: "square.and.arrow.up")
                                        Text("Share")
                                    }
                                    .fontWeight(.medium)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 48)
                                    .background(Color.white.opacity(0.08))
                                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.appBorder, lineWidth: 1))
                                    .foregroundColor(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                }
                            }

                            // Create another
                            Button(action: onCreateAnother) {
                                HStack(spacing: 6) {
                                    Image(systemName: "plus")
                                    Text("New Image")
                                }
                                .fontWeight(.medium)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(Color.white.opacity(0.08))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.appBorder, lineWidth: 1))
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }
                    }

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
            }
        }
        .navigationTitle("Your Image")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(false)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    private func saveToGallery() {
        galleryStore.save(imageData: imageData, prompt: prompt, model: model, style: style)
        isSaved = true
    }
}
