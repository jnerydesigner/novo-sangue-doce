import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sangue Doce | Cuidado diario para viver melhor com diabetes",
  description:
    "Jornalismo e cuidado sobre diabetes, prevencao, alimentacao e saude metabolica para o dia a dia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
