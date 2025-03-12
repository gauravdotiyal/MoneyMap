import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subset: ["latin"] });

export const metadata = {
  title: "Money Map",
  description: "Navigate your finance efficiently",
};

export default function RootLayout({ children }) {
  return (
  <ClerkProvider>
    <html lang="en">
      <body className={`${inter.className}`}>
        {/* header  */}
        <Header />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2025 Money Map</p>
          </div>
        </footer>
      </body>
    </html>
  </ClerkProvider>
  );
}
