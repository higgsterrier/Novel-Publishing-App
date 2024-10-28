import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";

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
        <Header />
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
