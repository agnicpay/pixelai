import Foundation

struct ImageGenerationModel: Identifiable, Hashable {
    let id: String
    let name: String
    let costPerImage: Double
    let tag: String?
    let supportsReferenceImage: Bool
    let isDefault: Bool

    var formattedCost: String {
        if costPerImage < 0.001 { return String(format: "$%.5f", costPerImage) }
        if costPerImage < 0.01  { return String(format: "$%.4f", costPerImage) }
        return String(format: "$%.3f", costPerImage)
    }
}

struct ImageStyle: Identifiable, Hashable {
    let id: String
    let label: String
    let suffix: String
}

let availableModels: [ImageGenerationModel] = [
    .init(id: "google/gemini-2.5-flash-image",      name: "Gemini 2.5 Flash",  costPerImage: 0.00124,    tag: "Best Value",   supportsReferenceImage: true, isDefault: true),
    .init(id: "google/gemini-3-pro-image-preview",  name: "Gemini 3 Pro",      costPerImage: 0.067,      tag: "High Quality", supportsReferenceImage: true, isDefault: false),
    .init(id: "openai/gpt-5-image",                 name: "GPT-5 Image",       costPerImage: 0.00001,    tag: nil,            supportsReferenceImage: true, isDefault: false),
    .init(id: "openai/gpt-5-image-mini",            name: "GPT-5 Image Mini",  costPerImage: 0.0000025,  tag: "Cheapest",     supportsReferenceImage: true, isDefault: false),
]

let availableStyles: [ImageStyle] = [
    .init(id: "none",           label: "No Style",       suffix: ""),
    .init(id: "photorealistic", label: "Photorealistic", suffix: ", photorealistic, 8k, ultra detailed photography"),
    .init(id: "digital-art",    label: "Digital Art",    suffix: ", digital art, vibrant colors, detailed illustration"),
    .init(id: "anime",          label: "Anime",          suffix: ", anime style, cel shaded, studio ghibli inspired"),
    .init(id: "oil-painting",   label: "Oil Painting",   suffix: ", oil painting style, impressionist, textured brush strokes"),
    .init(id: "watercolor",     label: "Watercolor",     suffix: ", watercolor painting, soft edges, flowing colors"),
    .init(id: "3d-render",      label: "3D Render",      suffix: ", 3d render, octane render, cinema 4d, volumetric lighting"),
    .init(id: "pixel-art",      label: "Pixel Art",      suffix: ", pixel art style, retro, 16-bit"),
    .init(id: "comic",          label: "Comic Book",     suffix: ", comic book style, bold lines, halftone dots, dynamic"),
]

let defaultModel = availableModels.first(where: { $0.isDefault }) ?? availableModels[0]
