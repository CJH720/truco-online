import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Truco Online - O Melhor Jogo de Truco do Brasil",
  description: "Jogue Truco online com amigos ou encontre oponentes. Sistema de ranking, conquistas e muito mais. 100% grátis!",
  keywords: ["truco", "truco online", "jogo de cartas", "truco paulista", "jogar truco"],
  authors: [{ name: "Truco Online" }],
  openGraph: {
    title: "Truco Online - O Melhor Jogo de Truco do Brasil",
    description: "Jogue Truco online com amigos ou encontre oponentes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
