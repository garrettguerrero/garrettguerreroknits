import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Garrett Guerrero Knits",
  description: "Beautifully crafted knitting and crochet patterns",
};

export const viewport: Viewport = {
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-white text-gray-900`}
      >
        <Toaster position="top-right" />
        {!isAdminPage && <Navbar />}
        {children}
        {!isAdminPage && <Footer />}
      </body>
    </html>
  );
}
