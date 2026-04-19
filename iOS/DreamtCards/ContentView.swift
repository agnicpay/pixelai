import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        Group {
            if authVM.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .preferredColorScheme(.dark)
    }
}

struct MainTabView: View {
    @EnvironmentObject var galleryStore: GalleryStore

    var body: some View {
        TabView {
            CreationFlowView()
                .tabItem { Label("Create", systemImage: "wand.and.stars") }

            GalleryView()
                .tabItem { Label("Gallery", systemImage: "photo.stack") }
        }
        .tint(Color.appAccent)
    }
}
