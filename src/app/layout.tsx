import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
 
import LayoutWrapper from "./component/layout/LayoutWrapper";
 import SmartSuppScript from "./component/user/SmartSuppScript";

// Use system fonts as fallback
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: 'swap',
});

// Or use system fonts without Google Fonts
// const systemFont = {
//   variable: "--font-system",
//   style: "normal",
// };

export const metadata: Metadata = {
  title: "CRYPTAURA INVESTSPHERE COMPANY | Premium Investment Platform",
  description:
    "CRYPTAURA INVESTSPHERE COMPANY empowers you to grow your wealth through secure, transparent, and high-yield investment portfolios. Join our trusted platform and take charge of your financial future.",
  keywords: [
    "CRYPTAURA INVESTSPHERE COMPANY",
    "Investment Platform",
    "Secure Investment",
    "Portfolio Management",
    "Wealth Growth",
    "Investment Solutions",
    "Financial Planning",
    "High-Yield Investment"
  ],
  authors: [{ name: "CRYPTAURA INVESTSPHERE Team", url: "https://cryptaura-investsphere-company.vercel.app/" }],
  openGraph: {
    title: "CRYPTAURA INVESTSPHERE COMPANY | Premium Investment Platform",
    description:
      "Grow your wealth through our trusted and transparent investment platform. Start investing with confidence and achieve your financial goals.",
    url: "https://cryptaura-investsphere-company.vercel.app/",
    siteName: "CRYPTAURA INVESTSPHERE COMPANY",
    images: [
      {
        url: "https://cryptaura-investsphere-company.vercel.app/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "CRYPTAURA INVESTSPHERE COMPANY premium investment platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRYPTAURA INVESTSPHERE COMPANY | Premium Investment Platform",
    description:
      "Join CRYPTAURA INVESTSPHERE COMPANY and take charge of your financial future with strategic investment solutions.",
    images: ["https://cryptaura-investsphere-company.vercel.app/opengraph-image.jpg"],
    creator: "@cryptaura_invest",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <SmartSuppScript /> 
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}