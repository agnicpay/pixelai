import SwiftUI

struct GalleryView: View {
    @EnvironmentObject var galleryStore: GalleryStore
    @State private var selectedItem: GalleryItem?

    private let columns = [GridItem(.flexible(), spacing: 2), GridItem(.flexible(), spacing: 2)]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground.ignoresSafeArea()

                if galleryStore.items.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 2) {
                            ForEach(galleryStore.items) { item in
                                GalleryThumbnail(item: item, store: galleryStore)
                                    .onTapGesture { selectedItem = item }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Gallery")
            .toolbarColorScheme(.dark, for: .navigationBar)
            .sheet(item: $selectedItem) { item in
                GalleryDetailView(item: item)
                    .environmentObject(galleryStore)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "photo.stack")
                .font(.system(size: 52))
                .foregroundStyle(LinearGradient.appGradient)
            Text("No images yet")
                .font(.headline)
                .foregroundColor(.white)
            Text("Generate your first image and save it here.")
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.45))
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 40)
    }
}

private struct GalleryThumbnail: View {
    let item: GalleryItem
    let store: GalleryStore

    var body: some View {
        Group {
            if let image = store.loadImage(for: item) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(minWidth: 0, maxWidth: .infinity)
                    .aspectRatio(1, contentMode: .fill)
                    .clipped()
            } else {
                Color.appCard
                    .aspectRatio(1, contentMode: .fill)
                    .overlay(Image(systemName: "photo").foregroundColor(.white.opacity(0.3)))
            }
        }
    }
}
