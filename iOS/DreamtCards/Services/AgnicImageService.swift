import Foundation

class AgnicImageService {
    static let shared = AgnicImageService()

    private let apiBase = "https://api.agnic.ai"

    // MARK: - Image generation

    func generateImage(prompt: String, modelId: String, style: ImageStyle, accessToken: String) async throws -> Data {
        let fullPrompt = style.suffix.isEmpty ? prompt : "\(prompt)\(style.suffix)"

        let body: [String: Any] = [
            "model":      modelId,
            "messages":   [["role": "user", "content": fullPrompt]],
            "modalities": ["image", "text"],
            "max_tokens": 1024,
        ]

        var request = URLRequest(url: URL(string: "\(apiBase)/v1/chat/completions")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 120

        let (data, response) = try await URLSession.shared.data(for: request)

        if let http = response as? HTTPURLResponse, http.statusCode != 200 {
            let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
            throw ImageServiceError.apiError(msg ?? "HTTP \(http.statusCode)")
        }

        guard let json     = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let choices  = json["choices"] as? [[String: Any]],
              let message  = choices.first?["message"] as? [String: Any],
              let images   = message["images"] as? [[String: Any]],
              let imageUrl = (images.first?["image_url"] as? [String: Any])?["url"] as? String
        else { throw ImageServiceError.noImageReturned }

        return try await decodeImageURL(imageUrl)
    }

    // MARK: - Prompt enhancement

    func enhancePrompt(_ prompt: String, accessToken: String) async throws -> String {
        let body: [String: Any] = [
            "model": "openai/gpt-4o-mini",
            "messages": [
                ["role": "system", "content": "You are an expert AI image prompt engineer. Enhance the user's prompt to produce a more vivid, detailed, and visually stunning image. Keep the core concept, but add specifics about lighting, composition, mood, colors, and artistic details. Output ONLY the enhanced prompt, nothing else. Keep it under 200 words."],
                ["role": "user", "content": prompt],
            ],
            "max_tokens": 300,
        ]

        var request = URLRequest(url: URL(string: "\(apiBase)/v1/chat/completions")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)

        guard let json    = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let choices = json["choices"] as? [[String: Any]],
              let msg     = choices.first?["message"] as? [String: Any],
              let content = msg["content"] as? String
        else { return prompt }

        return content
    }

    // MARK: - Helpers

    private func decodeImageURL(_ urlString: String) async throws -> Data {
        if urlString.hasPrefix("data:image/") {
            guard let commaIdx = urlString.firstIndex(of: ",") else {
                throw ImageServiceError.invalidImageData
            }
            let base64 = String(urlString[urlString.index(after: commaIdx)...])
            guard let decoded = Data(base64Encoded: base64) else {
                throw ImageServiceError.invalidImageData
            }
            return decoded
        } else {
            guard let url = URL(string: urlString) else { throw ImageServiceError.invalidImageData }
            let (imageData, _) = try await URLSession.shared.data(from: url)
            return imageData
        }
    }
}

enum ImageServiceError: LocalizedError {
    case apiError(String)
    case noImageReturned
    case invalidImageData

    var errorDescription: String? {
        switch self {
        case .apiError(let msg):  return msg
        case .noImageReturned:    return "No image was returned from the model."
        case .invalidImageData:   return "Could not decode the returned image."
        }
    }
}
