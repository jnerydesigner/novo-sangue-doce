import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { PageVisitTracker } from "@/components/analytics/page-visit-tracker";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2f5d3c",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Cuidado diário para viver melhor com diabetes`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Cuidado diário para viver melhor com diabetes`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
  icons: {
    apple: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        type: "image/png",
        url: "/apple-touch-icon.png",
      },
    ],
    icon: [
      {
        sizes: "1024x1024",
        type: "image/png",
        url: "/sangue-doce-logo-small.png",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={roboto.variable}
    >
      <body className={roboto.variable}>
        {children}
        <PageVisitTracker />
      </body>
    </html>
  );
}
