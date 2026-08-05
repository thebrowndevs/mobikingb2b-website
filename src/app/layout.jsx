import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import Script from "next/script";

const font = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_NAME = "Mobiking Wholesale";
const SITE_URL = "https://mobikingwholesale.com";
const DEFAULT_DESCRIPTION =
  "Open-Box Electronics at Unbeatable Prices — Mobiking Wholesale. Shop speakers, cables, chargers, computer accessories, earbuds, headphones, and more at wholesale rates.";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

export const metadata = {
  title: "Open-Box Electronics at Unbeatable Prices - Shop Now - Mobiking Wholesale",
  description: DEFAULT_DESCRIPTION,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Basic */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="pEzIEyl719Z2rAHCoOgm0EHipeRQ620wBuf-dyLv-54" />

        {/* SEO robots */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={DEFAULT_IMAGE} />
        <meta property="og:image:alt" content={`${SITE_NAME} - Best wholesale electronics`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MobikingWholesale" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_IMAGE} />

        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              sameAs: [],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+91-8448272134",
                  contactType: "customer service",
                  areaServed: "IN",
                  availableLanguage: ["English", "Hindi"],
                },
              ],
            }),
          }}
        />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${font.variable} antialiased`}>
        <AuthProvider>
          <Header />
          {children}
          <Toaster position="top-center" richColors />
          <Footer />
        </AuthProvider>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VMEQP6Y848"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-VMEQP6Y848');
  `}
        </Script>
      </body>
    </html>
  );
}
