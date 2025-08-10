// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // Import the new Header

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jonathan's Café",
  description: "Restaurant Booking and Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header /> {/* Add the Header component here */}
        {children}
      </body>
    </html>
  );
}
