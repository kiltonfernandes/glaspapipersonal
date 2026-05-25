import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glasp API Personal",
  description: "Busque e transforme seus highlights do Glasp em contexto para IA."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
