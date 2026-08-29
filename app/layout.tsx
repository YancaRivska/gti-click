import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(
    productionHost ? `https://${productionHost}` : "http://localhost:3000",
  ),
  title: {
    default: "GTI CLICK | Galera do TI",
    template: "%s | GTI CLICK",
  },
  description: "A galera registra. O GTI guarda.",
  applicationName: "GTI CLICK",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/assets/gti-click/logo-primary.jpg",
    apple: "/assets/gti-click/logo-primary.jpg",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "GTI CLICK",
    title: "GTI CLICK | Galera do TI",
    description: "A galera registra. O GTI guarda.",
    images: [
      {
        url: "/assets/gti-click/banner.jpg",
        width: 1536,
        height: 614,
        alt: "GTI CLICK — A galera registra. O GTI guarda.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GTI CLICK | Galera do TI",
    description: "A galera registra. O GTI guarda.",
    images: ["/assets/gti-click/banner.jpg"],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "GTI CLICK",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
