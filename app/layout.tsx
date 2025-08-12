// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header"; // Import the new Header

export const metadata: Metadata = {
  title: "Jonathan's Cafe MVP",
  description: "Restaurant Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Header /> {/* Add the Header here */}
        <main>{children}</main> {/* Render the page content below the header */}
      </body>
    </html>
  );
}