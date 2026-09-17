import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toph — Farm operations dashboard",
  description: "Farm activity, recordings, and employee logs for Bays Ranch.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
