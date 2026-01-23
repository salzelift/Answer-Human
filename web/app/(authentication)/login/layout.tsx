import { Metadata } from "next";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your Answer Human account to access expert consultations, manage appointments, and connect with verified professionals.",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/login`,
    title: "Login | Answer Human",
    description:
      "Sign in to your Answer Human account to access expert consultations and manage appointments.",
    siteName: siteConfig.name,
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteConfig.url}/login`,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

