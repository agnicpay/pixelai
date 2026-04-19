import Foundation
import UIKit

@MainActor
class GalleryStore: ObservableObject {
    static let shared = GalleryStore()

    @Published var items: [GalleryItem] = []

    private let imagesDir: URL
    private let metadataURL: URL

    private init() {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        imagesDir   = docs.appendingPathComponent("gallery_images")
        metadataURL = docs.appendingPathComponent("gallery_metadata.json")
        try? FileManager.default.createDirectory(at: imagesDir, withIntermediateDirectories: true)
        load()
    }

    func save(imageData: Data, prompt: String, model: ImageGenerationModel, style: ImageStyle) {
        let fileName = UUID().uuidString + ".jpg"
        let fileURL  = imagesDir.appendingPathComponent(fileName)

        let jpegData = UIImage(data: imageData).flatMap { $0.jpegData(compressionQuality: 0.85) } ?? imageData
        try? jpegData.write(to: fileURL)

        let item = GalleryItem(
            imageFileName: fileName,
            prompt: prompt,
            modelId: model.id,
            modelName: model.name,
            styleId: style.id,
            styleLabel: style.label
        )
        items.insert(item, at: 0)
        persist()
    }

    func delete(_ item: GalleryItem) {
        try? FileManager.default.removeItem(at: imagesDir.appendingPathComponent(item.imageFileName))
        items.removeAll { $0.id == item.id }
        persist()
    }

    func loadImage(for item: GalleryItem) -> UIImage? {
        let url = imagesDir.appendingPathComponent(item.imageFileName)
        guard let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }

    private func load() {
        guard let data    = try? Data(contentsOf: metadataURL),
              let decoded = try? JSONDecoder().decode([GalleryItem].self, from: data)
        else { return }
        items = decoded
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(items) else { return }
        try? data.write(to: metadataURL)
    }
}
