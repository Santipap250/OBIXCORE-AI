// app/robots.ts
// Generates /robots.txt. Allows full crawl (the entire app is public,
// client-side tooling with no auth-gated content) and points crawlers at
// the generated sitemap.
import type { MetadataRoute } from "next";

const SITE_URL = "https://obixcore.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
