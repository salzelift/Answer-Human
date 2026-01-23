import { Metadata } from "next";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Become an Expert",
  description:
    "Join Answer Human as an expert and monetize your knowledge. Share your expertise, set your own rates, and help people solve real problems. Apply today!",
  keywords: [
    "become an expert",
    "expert registration",
    "monetize knowledge",
    "consulting platform",
    "freelance expert",
    "sell expertise",
    "professional consultant",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/expert/onboarding`,
    title: "Become an Expert | Answer Human",
    description:
      "Join Answer Human as an expert and monetize your knowledge. Share your expertise and help people solve real problems.",
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: "Become an Expert on Answer Human",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Become an Expert | Answer Human",
    description:
      "Join Answer Human as an expert. Monetize your knowledge and help people solve real problems.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: siteConfig.twitterHandle,
  },
  alternates: {
    canonical: `${siteConfig.url}/expert/onboarding`,
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

