import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext"; // 1. Remove useAppContext import
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard"; // 2. Import the new component

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Milk Vendor Pro",
  description: "Manage your milk delivery business",
};

// 3. REMOVE the entire AuthGuard function that was here (lines 16-52)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AppProvider>
          <div className="max-w-lg mx-auto p-4 md:p-6 bg-white md:mt-10 md:rounded-2xl md:shadow-xl">
            <AuthGuard>
              <Navbar /> {/* The navigation tabs will appear on every page */}
              <main className="space-y-8 mt-8">
                {children} {/* Your pages will be rendered here */}
              </main>
            </AuthGuard>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}