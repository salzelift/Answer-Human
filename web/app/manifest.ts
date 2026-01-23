import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "AnswerHuman",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    categories: ["business", "education", "productivity"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/home.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Answer Human Homepage",
      },
      {
        src: "/screenshots/explore.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Explore Experts",
      },
    ],
    shortcuts: [
      {
        name: "Find Experts",
        short_name: "Explore",
        description: "Browse and find experts",
        url: "/explore",
        icons: [{ src: "/icons/explore.png", sizes: "96x96" }],
      },
      {
        name: "Post Question",
        short_name: "Ask",
        description: "Post a new question",
        url: "/post",
        icons: [{ src: "/icons/ask.png", sizes: "96x96" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}

