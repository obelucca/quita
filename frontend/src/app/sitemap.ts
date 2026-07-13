import { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog-posts";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const coreRoutes = [
    "",
    "/login",
    "/register",
    "/wizard",
    "/blog",
    "/registrato",
    "/consumidor-gov",
    "/o-que-e-scr",
    "/como-obter-registrato",
    "/como-usar-consumidor-gov",
    "/como-negociar-dividas",
  ];

  const sitemapItems: MetadataRoute.Sitemap = coreRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const blogItems: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...sitemapItems, ...blogItems];
}
