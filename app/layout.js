import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider"; // Make sure this exists

const inter = Inter({ subset: ["latin"] });

export const metadata = {
  title: "Money Map",
  description: "Navigate your finance efficiently",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {/* header */}
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
            <footer className="bg-blue-50 dark:bg-gray-800 py-12">
              <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
                <p>© 2025 Money Map</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}