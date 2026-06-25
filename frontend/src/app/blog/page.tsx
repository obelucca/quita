import React from "react";
import { Metadata } from "next";
import { BlogIndexClient } from "./blog-index-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Blog Educativo: Entenda seu Registrato e regularize suas dívidas",
  description: "Aprenda a emitir relatórios públicos do Banco Central, analise juros abusivos e melhore sua pontuação de crédito.",
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: "Blog Educativo: Entenda seu Registrato e regularize suas dívidas",
    description: "Aprenda a emitir relatórios públicos do Banco Central, analise juros abusivos e melhore sua pontuação de crédito.",
    url: `${siteUrl}/blog`,
    images: [`${siteUrl}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Educativo: Entenda seu Registrato e regularize suas dívidas",
    description: "Aprenda a emitir relatórios públicos do Banco Central, analise juros abusivos e melhore sua pontuação de crédito.",
    images: [`${siteUrl}/og-image.png`],
  }
};

export default function BlogPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${siteUrl}/blog`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogIndexClient />
    </>
  );
}
