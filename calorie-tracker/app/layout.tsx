import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calorie Tracker",
  description: "Track daily calories, protein and water for your fitness journey.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6823a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <main className="mx-auto w-full max-w-md px-5 pb-16 pt-8">{children}</main>
      </body>
    </html>
  );
}
