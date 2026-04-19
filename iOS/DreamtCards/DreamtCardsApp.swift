import SwiftUI

@main
struct DreamtCardsApp: App {
    @StateObject private var authVM       = AuthViewModel()
    @StateObject private var galleryStore = GalleryStore.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authVM)
                .environmentObject(galleryStore)
        }
    }
}
