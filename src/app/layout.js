// Root layout for the Next.js app. Provides global fonts, header navigation,
// and the main layout container used by all pages.
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CruxLog",
  description: "Track climbing progress",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          {/* Dark grey banner for the app header (mobile-friendly high-contrast) */}
          <header className="bg-black-400 backdrop-blur sticky top-0 z-20 border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg text-white">CruxLog</Link>
              <nav className="flex items-center gap-4">
                <Link href="/dashboard" className="text-white hover:underline">Dashboard</Link>
                <Link href="/problems" className="text-white hover:underline">Problems</Link>
                <Link href="/sessions/new" className="text-white hover:underline">Log Session</Link>
              </nav>
            </div>
          </header>

          {/* Main content area where page children are rendered */}
          <main className="flex-1 max-w-6xl mx-auto px-4 py-8">{children}</main>

          <footer className="border-t">
            <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-center text-muted-foreground">CruxLog — Local prototype</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
