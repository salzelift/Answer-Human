import { Metadata } from "next";
import { siteConfig, generateExpertSchema } from "@/lib/seo-config";

// API base URL for fetching dynamic data
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ExpertData {
  id: string;
  name: string;
  description?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  profilePictureUrl?: string;
  location?: string;
  skills?: string[];
}

async function getExpert(id: string): Promise<ExpertData | null> {
  try {
    const response = await fetch(`${API_URL}/api/provider/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching expert for metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const expert = await getExpert(id);

  if (!expert) {
    return {
      title: "Expert Not Found",
      description: "The expert profile you're looking for could not be found.",
    };
  }

  const title = expert.jobTitle
    ? `${expert.name} - ${expert.jobTitle}`
    : expert.name;

  const description =
    expert.description ||
    expert.bio ||
    `Book a consultation with ${expert.name}${expert.jobTitle ? `, ${expert.jobTitle}` : ""}${expert.company ? ` at ${expert.company}` : ""}. Get expert advice on ${expert.skills?.slice(0, 3).join(", ") || "various topics"}.`;

  const url = `${siteConfig.url}/expert/${id}`;
  const ogImage = expert.profilePictureUrl || `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title,
    description,
    keywords: [
      expert.name,
      expert.jobTitle || "",
      expert.company || "",
      ...(expert.skills || []),
      "expert consultation",
      "book appointment",
      "professional advice",
    ].filter(Boolean),
    openGraph: {
      type: "profile",
      locale: siteConfig.locale,
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 400,
          height: 400,
          alt: expert.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage],
      creator: siteConfig.twitterHandle,
    },
    alternates: {
      canonical: url,
    },
    other: {
      "profile:first_name": expert.name.split(" ")[0],
      "profile:last_name": expert.name.split(" ").slice(1).join(" "),
    },
  };
}

export default function ExpertProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

