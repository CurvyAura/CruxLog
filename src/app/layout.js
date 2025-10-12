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
          <header className="bg-white/60 backdrop-blur sticky top-0 z-20 border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg">CruxLog</Link>
              <nav className="flex items-center gap-4">
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                <Link href="/problems" className="hover:underline">Problems</Link>
                <Link href="/sessions/new" className="hover:underline">Log Session</Link>
              </nav>
            </div>
          </header>

          <main className="flex-1 max-w-6xl mx-auto px-4 py-8">{children}</main>

          <footer className="border-t">
            <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-center text-muted-foreground">CruxLog — Local prototype</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
