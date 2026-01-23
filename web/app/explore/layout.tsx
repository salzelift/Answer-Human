import { Metadata } from "next";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Explore Experts - Find Verified Professionals",
  description:
    "Browse our marketplace of verified experts across technology, design, career coaching, legal, finance, and more. Compare profiles, read reviews, and book consultations instantly.",
  keywords: [
    "find experts",
    "expert marketplace",
    "professional consultation",
    "verified experts",
    "book appointment",
    "career coach",
    "tech consultant",
    "design expert",
    "legal advice",
    "financial advisor",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/explore`,
    title: "Explore Experts - Find Verified Professionals | Answer Human",
    description:
      "Browse our marketplace of verified experts across technology, design, career coaching, legal, finance, and more.",
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: "Explore Experts on Answer Human",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Experts - Find Verified Professionals",
    description:
      "Browse our marketplace of verified experts. Compare profiles, read reviews, and book consultations instantly.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: siteConfig.twitterHandle,
  },
  alternates: {
    canonical: `${siteConfig.url}/explore`,
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

