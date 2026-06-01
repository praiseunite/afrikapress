import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"
import { LocaleProvider } from "@/components/shared/LocaleProvider"
import { Navbar } from "@/components/shared/Navbar";
import { ServiceWorkerCleaner } from "@/components/shared/ServiceWorkerCleaner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AfrikaPress",
  description: "Censorship-Resistant Journalism for Africa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AfrikaPress"
  }
};

export const viewport = {
  themeColor: "#10b981"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-black text-white antialiased">
        <LocaleProvider>
          <ServiceWorkerCleaner />
          <Navbar />
          <main>{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
