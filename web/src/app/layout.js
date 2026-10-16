import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Promotly — Terfi ve Başarı Arşivi",
  description:
    "Her cuma 5 dakika ayır, yaptıklarını kaydet. Performans görüşmesinde ne yaptığını hatırlamaya çalışma; AI kanıtlarla desteklenmiş raporunu hazırlasın.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
