// app/sitemap.ts
// Generates /sitemap.xml at build/request time. Derives entries from
// NAV_ITEMS (components/nav/nav-items.tsx) plus the few routes that aren't
// in primary nav (profiles/new), so adding a route to navigation
// automatically keeps the sitemap in sync — no second list to maintain.
import type { MetadataRoute } from "next";
import { NAV_ITEMS } from "@/components/nav/nav-items";

const SITE_URL = "https://obixcore.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const navRoutes: MetadataRoute.Sitemap = NAV_ITEMS.map((item) => ({
    url: `${SITE_URL}${item.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: item.href === "/dashboard" ? 1 : 0.8,
  }));

  const extraRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/profiles/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...navRoutes, ...extraRoutes];
}
