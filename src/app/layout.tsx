import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Novel Publishing App",
  description:
    "A platform for new and aspiring authors to publish their novels",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-xl font-bold text-gray-800">
              NovelNest
            </a>
            <div className="space-x-4">
              <a href="/novels" className="text-gray-600 hover:text-gray-800">
                Browse
              </a>
              <a
                href="/novels/submit"
                className="text-gray-600 hover:text-gray-800"
              >
                Publish
              </a>
              <a href="/login" className="text-gray-600 hover:text-gray-800">
                Login
              </a>
              <a href="/register" className="text-gray-600 hover:text-gray-800">
                Register
              </a>
            </div>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-800 text-white py-4 mt-12">
          <div className="container mx-auto px-4 text-center">
            &copy; 2023 NovelNest. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
