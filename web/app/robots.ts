import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/profile/",
          "/appointments/",
          "/expert/profile/",
          "/expert/requests/",
          "/expert/communicate/",
          "/expert/feed/",
          "/post/",
          "/_next/",
          "/private/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/profile/",
          "/appointments/",
          "/expert/profile/",
          "/expert/requests/",
          "/expert/communicate/",
          "/expert/feed/",
          "/post/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

