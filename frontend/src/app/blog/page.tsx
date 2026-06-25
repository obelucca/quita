"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { SeoLayout } from "@/components/ui/seo-layout";
import { blogPosts, BlogPost } from "@/data/blog-posts";
import { Search, Calendar, Clock, ArrowRight, Sparkles, BookOpen, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  // Retrieve categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(blogPosts.map((post) => post.category));
    return ["Todos", ...Array.from(cats)];
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <SeoLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Educação Financeira</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Blog Educativo Quita
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            Entenda seus direitos, aprenda a emitir relatórios públicos do Banco Central, analise juros abusivos e melhore sua pontuação de crédito.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-200">
          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Pesquisar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {/* Blog Post Grid & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Grid Area */}
          <div className="lg:col-span-8">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="group bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg uppercase tracking-wider text-[10px]">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="text-slate-550 text-xs leading-relaxed line-clamp-3 font-medium">
                        {post.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-450 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.publishDate}</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors"
                      >
                        Ler artigo
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-150">
                <p className="text-slate-450 text-sm font-medium">Nenhum artigo encontrado para a pesquisa.</p>
              </div>
            )}
          </div>

          {/* Sidebar CTA Card Area */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Main Assistant Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl border border-emerald-500/10 p-6 sm:p-8 space-y-6 shadow-lg relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Assistente Gratuito</span>
                </span>
                <h3 className="text-xl font-bold tracking-tight">Precisa de ajuda com o Registrato?</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Não sofra decifrando dados difíceis sozinho. O Quita extrai todas as informações de dívida e gera sua petição jurídica completa para o Consumidor.gov.br em poucos cliques.
                </p>
              </div>

              <Link href="/wizard" className="block">
                <Button variant="primary" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
                  Começar agora
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Support Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Sobre o Quita</span>
              </h4>
              <p className="text-slate-550 text-xs leading-relaxed font-medium">
                Desenvolvemos uma ferramenta inteligente orientada a simplificar e democratizar a conciliação financeira do brasileiro.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </SeoLayout>
  );
}
