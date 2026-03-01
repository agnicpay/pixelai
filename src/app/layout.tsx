import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelAI — AI Image Generation",
  description:
    "Create stunning AI-generated images with PixelAI. Powered by state-of-the-art models. Pay per image, no subscriptions.",
  openGraph: {
    title: "PixelAI — AI Image Generation",
    description: "Create stunning AI-generated images with PixelAI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#12121a",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}
