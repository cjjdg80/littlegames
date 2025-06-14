// src/app/games/page.tsx - 游戏总览页面
// 功能说明: 显示所有游戏分类的概览页面，提供快速导航到各个分类

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, ChevronRight, Search } from "lucide-react";
import { getAvailableCategories } from "@/lib/categorySEO";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * 生成页面元数据
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All Game Categories - Play Browser Mini Games",
    description: "Browse all game categories and discover thousands of free online games. Action, adventure, puzzle, strategy games and more!",
    keywords: ["game categories", "online games", "free browser games", "game genres"],
    openGraph: {
      title: "All Game Categories - Play Browser Mini Games",
      description: "Browse all game categories and discover thousands of free online games",
      url: "https://playbrowserminigames.com/games",
      siteName: "Play Browser Mini Games",
      images: [
        {
          url: "/images/default-game-thumbnail.svg",
          width: 1200,
          height: 630,
          alt: "Game categories overview"
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "All Game Categories - Play Browser Mini Games",
      description: "Browse all game categories and discover thousands of free online games",
      images: ["/images/default-game-thumbnail.svg"]
    },
    alternates: {
      canonical: "https://playbrowserminigames.com/games"
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

/**
 * 分类数据接口
 */
interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  gameCount: number;
  icon: string;
}

/**
 * 获取分类信息
 */
async function getCategoryInfoList(): Promise<CategoryInfo[]> {
  const availableCategories = await getAvailableCategories();
  
  // 分类信息映射
  const categoryMap: Record<string, Omit<CategoryInfo, 'slug'>> = {
    action: {
      name: "Action",
      description: "Fast-paced games with intense gameplay and combat",
      gameCount: 1500,
      icon: "⚔️"
    },
    adventure: {
      name: "Adventure", 
      description: "Epic quests and exploration games",
      gameCount: 1200,
      icon: "🗺️"
    },
    arcade: {
      name: "Arcade",
      description: "Classic arcade-style games",
      gameCount: 2100,
      icon: "🕹️"
    },
    casual: {
      name: "Casual",
      description: "Easy-to-play games for everyone",
      gameCount: 1800,
      icon: "🎲"
    },
    puzzle: {
      name: "Puzzle",
      description: "Brain teasers and logic games",
      gameCount: 1800,
      icon: "🧩"
    },
    simulation: {
      name: "Simulation",
      description: "Realistic simulations and life management games",
      gameCount: 800,
      icon: "🏗️"
    },
    sports: {
      name: "Sports",
      description: "Athletic and competition games",
      gameCount: 600,
      icon: "⚽"
    },
    strategy: {
      name: "Strategy",
      description: "Tactical planning and strategic thinking games",
      gameCount: 900,
      icon: "♟️"
    }
  };

  return availableCategories.map(slug => ({
    slug,
    ...categoryMap[slug] || {
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      description: `${slug.charAt(0).toUpperCase() + slug.slice(1)} games`,
      gameCount: 500,
      icon: "🎮"
    }
  }));
}

/**
 * 游戏总览页面组件
 */
export default async function GamesOverviewPage() {
  const categories = await getCategoryInfoList();
  const totalGames = categories.reduce((sum, cat) => sum + cat.gameCount, 0);

  // 生成结构化数据
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Game Categories",
    "description": "Browse all game categories and discover thousands of free online games",
    "url": "https://playbrowserminigames.com/games",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Game Categories",
      "numberOfItems": categories.length,
      "itemListElement": categories.map((category, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": category.name,
        "url": `https://playbrowserminigames.com/games/${category.slug}`,
        "description": category.description
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://playbrowserminigames.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Games",
          "item": "https://playbrowserminigames.com/games"
        }
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Play Browser Mini Games",
      "url": "https://playbrowserminigames.com"
    }
  });

  return (
    <>
      {/* 结构化数据 - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      {/* 页面内容 */}
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* 导航栏 */}
        <Header />

        {/* 面包屑导航 */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 py-3 text-sm">
              <Link href="/" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                Home
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-300 font-medium">Games</span>
            </div>
          </div>
        </nav>

        {/* 页面标题和描述 */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">All Game Categories</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
                Browse through our collection of {totalGames.toLocaleString()}+ free online games across {categories.length} different categories
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>{categories.length} Categories</span>
                <span>•</span>
                <span>{totalGames.toLocaleString()}+ Games</span>
                <span>•</span>
                <span>Free to Play</span>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <main className="flex-1">
          {/* 分类网格 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/games/${category.slug}`}
                  className="group block h-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border border-gray-700 hover:border-gray-600 h-full">
                    {/* 分类图标 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{category.icon}</div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>

                    {/* 分类信息 */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                        {category.description}
                      </p>
                    </div>

                    {/* 游戏数量 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                        {category.gameCount.toLocaleString()}+ games
                      </span>
                      <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                        <Gamepad2 className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Play Now</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* 底部统计信息 */}
        <div className="bg-gray-800 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Playing?</h2>
              <p className="text-gray-300 mb-6">
                Join thousands of players enjoying our free online games
              </p>
              <Link
                href="/"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Start Playing Now
              </Link>
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <Footer />
      </div>
    </>
  );
} 