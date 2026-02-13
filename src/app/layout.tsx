import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MTG Price Tracker",
  description: "Personal MTG singles watchlist and price alerts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
