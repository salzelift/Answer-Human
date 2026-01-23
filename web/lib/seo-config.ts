/**
 * SEO Configuration - Central place for all SEO-related constants
 */

export const siteConfig = {
  name: "Answer Human",
  title: "Answer Human - Connect with Verified Experts for Real Answers",
  description:
    "Skip the endless searching. Connect directly with verified professionals who can solve your exact problem — right now. Get expert advice on demand via chat, call, or video.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://answerhuman.com",
  ogImage: "/og-image.png",
  twitterHandle: "@answerhuman",
  creator: "Answer Human",
  keywords: [
    "expert advice",
    "professional consultation",
    "online mentoring",
    "knowledge marketplace",
    "career coaching",
    "legal advice",
    "tax help",
    "tech support",
    "business consulting",
    "verified experts",
    "on-demand experts",
    "video consultation",
    "expert Q&A",
  ],
  authors: [{ name: "Answer Human", url: "https://answerhuman.com" }],
  themeColor: "#10b981", // emerald-500
  backgroundColor: "#ffffff",
  locale: "en_US",
  type: "website" as const,
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  sameAs: [
    "https://twitter.com/answerhuman",
    "https://linkedin.com/company/answerhuman",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@answerhuman.com",
    contactType: "customer support",
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/explore?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Metadata helpers
export function generatePageMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}) {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title,
    description,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    openGraph: {
      type: siteConfig.type,
      locale: siteConfig.locale,
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
      creator: siteConfig.twitterHandle,
    },
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

// Expert profile schema
export function generateExpertSchema(expert: {
  id: string;
  name: string;
  description?: string;
  jobTitle?: string;
  company?: string;
  profilePictureUrl?: string;
  location?: string;
  skills?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/expert/${expert.id}`,
    name: expert.name,
    description: expert.description,
    jobTitle: expert.jobTitle,
    worksFor: expert.company
      ? {
          "@type": "Organization",
          name: expert.company,
        }
      : undefined,
    image: expert.profilePictureUrl,
    address: expert.location
      ? {
          "@type": "PostalAddress",
          addressLocality: expert.location,
        }
      : undefined,
    knowsAbout: expert.skills,
    url: `${siteConfig.url}/expert/${expert.id}`,
  };
}

// FAQ schema for question pages
export function generateFAQSchema(
  questions: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

