import React from "react";
import { Metadata } from "next";
import { BlogIndexClient } from "./blog-index-client";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Blog Educativo: Entenda seu Registrato e regularize suas dívidas",
  description: "Aprenda a emitir relatórios públicos do Banco Central, analise juros abusivos e melhore sua pontuação de crédito.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Blog Educativo: Entenda seu Registrato e regularize suas dívidas",
    description: "Aprenda a emitir relatórios públicos do Banco Central, analise juros abusivos e melhore sua pontuação de crédito.",
    url: `${SITE_URL}/blog`,
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Educativo: Entenda seu Registrato e regularize suas dívidas",
    description: "Aprenda a emitir relatórios públicos do Banco Central, analise juros abusivos e melhore sua pontuação de crédito.",
    images: [`${SITE_URL}/og-image.png`],
  }
};

export default function BlogPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${SITE_URL}/blog`
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
