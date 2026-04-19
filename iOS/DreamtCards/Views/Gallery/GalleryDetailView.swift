import SwiftUI

struct GalleryDetailView: View {
    @EnvironmentObject var galleryStore: GalleryStore
    @Environment(\.dismiss) private var dismiss
    let item: GalleryItem

    @State private var showDeleteConfirm = false
    private var image: UIImage? { galleryStore.loadImage(for: item) }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        if let img = image {
                            Image(uiImage: img)
                                .resizable()
                                .scaledToFit()
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        VStack(alignment: .leading, spacing: 12) {
                            Text(item.prompt)
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.8))
                                .fixedSize(horizontal: false, vertical: true)

                            Divider().background(Color.appBorder)

                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    label("Model", value: item.modelName)
                                    label("Style", value: item.styleLabel)
                                    label("Created", value: item.createdAt.formatted(date: .abbreviated, time: .shortened))
                                }
                                Spacer()
                            }
                        }
                        .padding(16)
                        .cardStyle()
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Image Detail")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                        .foregroundColor(.white.opacity(0.7))
                }
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 16) {
                        if let img = image {
                            ShareLink(
                                item: Image(uiImage: img),
                                preview: SharePreview(item.prompt, image: Image(uiImage: img))
                            ) {
                                Image(systemName: "square.and.arrow.up")
                                    .foregroundColor(.white)
                            }
                        }
                        Button(role: .destructive) {
                            showDeleteConfirm = true
                        } label: {
                            Image(systemName: "trash")
                                .foregroundColor(.red.opacity(0.8))
                        }
                    }
                }
            }
            .confirmationDialog("Delete this image?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
                Button("Delete", role: .destructive) {
                    galleryStore.delete(item)
                    dismiss()
                }
                Button("Cancel", role: .cancel) {}
            }
        }
    }

    private func label(_ title: String, value: String) -> some View {
        HStack(spacing: 6) {
            Text(title + ":")
                .font(.caption.weight(.medium))
                .foregroundColor(.white.opacity(0.4))
            Text(value)
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
    }
}
