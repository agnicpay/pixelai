import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "dreamt.cards — Turn any idea into fire visuals",
  description:
    "AI image generator for creators. Comic panels, TikTok content, school projects, OC art — generated in seconds. $5 free credit, no subscription.",
  openGraph: {
    title: "dreamt.cards — Turn any idea into fire visuals",
    description: "AI image generator for creators. $5 free credit, no subscription.",
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
