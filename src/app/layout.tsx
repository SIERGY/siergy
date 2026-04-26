import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SIERGY | Sistem Prediksi Tanaman Padi Cerdas",
    template: "%s | SIERGY",
  },
  description:
    "SIERGY (Sistem Informasi Era Revolusi Green Yield) - Platform prediksi waktu tanam padi optimal menggunakan Machine Learning untuk meningkatkan produktivitas pertanian Indonesia.",
  keywords: [
    "SIERGY",
    "Sistem Prediksi Tanaman Padi",
    "Machine Learning Pertanian",
    "Prediksi Waktu Tanam",
    "Agritech Indonesia",
    "Smart Farming",
    "Skripsi Pertanian",
    "Next.js",
    "PostgreSQL",
    "Prediksi Iklim",
    "Analisis Tanah",
  ],
  authors: [
    { name: "Muhammad Dariaz Zidane" },
    { name: "Naila Nadira Azkarini" },
    { name: "Mochamad Fadil Nur Hakim" },
  ],
  creator: "Tim SIERGY",
  publisher: "SIERGY - Sistem Informasi Era Revolusi Green Yield",
  metadataBase: new URL("https://siergy.vercel.app"),
  openGraph: {
    title: "SIERGY - Solusi Cerdas Prediksi Tanam Padi",
    description:
      "Optimalkan hasil panen dengan prediksi akurat menggunakan teknologi Machine Learning. SIERGY membantu petani menentukan waktu tanam terbaik berdasarkan data tanah dan iklim.",
    url: "https://siergy.vercel.app",
    siteName: "SIERGY",
    images: [
      {
        url: "/siergy.png",
        width: 1200,
        height: 630,
        alt: "SIERGY - Smart Farming Solution",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIERGY - Sistem Prediksi Tanaman Padi Cerdas",
    description:
      "Platform prediksi waktu tanam optimal berbasis AI untuk petani Indonesia.",
    images: ["/siergy.png"],
    creator: "@siergy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "Agriculture Technology",
  classification: "Smart Farming Application",
  applicationName: "SIERGY",
  appleWebApp: {
    capable: true,
    title: "SIERGY",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: [
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/pwa-192x192.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body>{children}</body>
    </html>
  );
}
