import { Metadata } from "next";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Answer Human today. Create your free account to connect with verified experts, get personalized advice, and solve your problems faster.",
  keywords: [
    "sign up",
    "create account",
    "join Answer Human",
    "expert consultation",
    "get help",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/register`,
    title: "Create Account | Answer Human",
    description:
      "Join Answer Human today. Create your free account to connect with verified experts.",
    siteName: siteConfig.name,
  },
  alternates: {
    canonical: `${siteConfig.url}/register`,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

