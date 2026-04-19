import Foundation

struct GalleryItem: Codable, Identifiable {
    let id: UUID
    let imageFileName: String
    let prompt: String
    let modelId: String
    let modelName: String
    let styleId: String
    let styleLabel: String
    let createdAt: Date

    init(imageFileName: String, prompt: String, modelId: String, modelName: String, styleId: String, styleLabel: String) {
        self.id = UUID()
        self.imageFileName = imageFileName
        self.prompt = prompt
        self.modelId = modelId
        self.modelName = modelName
        self.styleId = styleId
        self.styleLabel = styleLabel
        self.createdAt = Date()
    }
}
