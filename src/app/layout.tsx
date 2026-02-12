import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Food Finder",
  description: "Map and moderate real-food sourcing locations around the world.",
  icons: {
    icon: [{ url: "/steak.svg?v=2", type: "image/svg+xml" }],
    shortcut: ["/steak.svg?v=2"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
