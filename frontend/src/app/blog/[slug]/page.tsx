import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoLayout } from "@/components/ui/seo-layout";
import { SeoCta } from "@/components/ui/seo-cta";
import { blogPosts } from "@/data/blog-posts";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ChevronRight, Calendar, Clock, Sparkles, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site-url";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for static site generation (SSG)
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Dynamic metadata generation for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    return {
      title: "Artigo Não Encontrado",
    };
  }

  return {
    title: `${post.title} | Blog Quita`,
    description: post.summary,
    keywords: [post.category.toLowerCase(), "quita", "registrato", "finanças", "scr", "consumidor.gov.br"],
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Blog Quita`,
      description: post.summary,
      url: `${SITE_URL}/blog/${post.slug}`,
      images: [`${SITE_URL}/og-image.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Blog Quita`,
      description: post.summary,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Schema Markup declarations
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: "2026-06-25T12:00:00Z",
    author: {
      "@type": "Organization",
      name: "Quita",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Quita",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <SeoLayout>
      {/* Injecting Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link and Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Início
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-emerald-600 transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-600 truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o blog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Content */}
          <article className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-8">
            {/* Header info */}
            <div className="space-y-4">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg uppercase tracking-wider text-[10px]">
                {post.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-450 font-medium pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Publicado em: {post.publishDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Leitura: {post.readTime}</span>
                </div>
              </div>
            </div>

            {/* Quick takeaway summary box */}
            <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-2xl flex gap-3">
              <Bookmark className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Resumo Rápido
                </span>
                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                  {post.takeaway}
                </p>
              </div>
            </div>

            {/* Render full Markdown Content */}
            <MarkdownRenderer content={post.markdownContent} />
          </article>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg relative overflow-hidden sticky top-6">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Automatização</span>
                </span>
                <h3 className="text-lg font-bold tracking-tight">Quer contestar essa dívida de graça?</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Deixe nossa IA gerar sua petição no formato ideal aceito pelo Consumidor.gov.br. Rápido, seguro e 100% legal.
                </p>
              </div>

              <Link href="/wizard" className="block">
                <Button
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  Começar agora
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </aside>
        </div>

        {/* Footer CTA */}
        <SeoCta />
      </div>
    </SeoLayout>
  );
}
