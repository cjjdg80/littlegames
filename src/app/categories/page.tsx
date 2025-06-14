// src/app/categories/page.tsx - 游戏分类总览页面
// 功能说明: 展示所有游戏分类，用户可以浏览和选择感兴趣的游戏类型

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCategorySEO } from "@/lib/categorySEO";
import { getCategoryStats } from "@/lib/gameDataLoader";
import { Gamepad2, Users, Star, TrendingUp } from "lucide-react";

// SEO元数据
export const metadata: Metadata = {
  title: "Game Categories - Play Browser Mini Games",
  description: "Browse games by category. Find action, puzzle, adventure, sports, strategy, arcade, casual and simulation games.",
  keywords: "game categories, browser games, online games, free games, game types",
  openGraph: {
    title: "Game Categories - Play Browser Mini Games",
    description: "Browse games by category. Find action, puzzle, adventure, sports, strategy, arcade, casual and simulation games.",
    url: "https://playbrowserminigames.com/categories",
    type: "website",
  },
};

// 分类数据配置
const categories = [
  {
    id: "action",
    name: "Action",
    description: "Fast-paced games with exciting gameplay and challenges",
    icon: "⚡",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "adventure",
    name: "Adventure", 
    description: "Explore new worlds and embark on epic journeys",
    icon: "🗺️",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
  {
    id: "puzzle",
    name: "Puzzle",
    description: "Challenge your mind with brain-teasing puzzles",
    icon: "🧩",
    color: "from-purple-500 to-violet-500", 
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Compete in your favorite sports and athletic games",
    icon: "⚽",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Plan, build, and conquer in strategic gameplay",
    icon: "♟️",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "arcade",
    name: "Arcade",
    description: "Classic arcade-style games for instant fun",
    icon: "🕹️",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10 border-pink-500/20",
  },
  {
    id: "casual",
    name: "Casual",
    description: "Easy-to-play games perfect for relaxation",
    icon: "🎮",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: "simulation",
    name: "Simulation",
    description: "Realistic simulations of real-world activities",
    icon: "🏗️",
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10 border-teal-500/20",
  },
];

export default async function CategoriesPage() {
  // 获取分类统计数据
  const categoryStats = await getCategoryStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Game Categories</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover thousands of free games organized by category. Find your favorite type of game and start playing instantly.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">9,726+ Games</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">12.5K Playing Now</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Updated Daily</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const stats = categoryStats[category.id] || { count: 0 };
                
                return (
                  <Link
                    key={category.id}
                    href={`/games/${category.id}`}
                    className="group block"
                  >
                    <div className={`
                      relative p-6 rounded-xl border transition-all duration-300
                      ${category.bgColor}
                      hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10
                      group-hover:border-blue-500/40
                    `}>
                      {/* Category Icon */}
                      <div className="text-4xl mb-4">{category.icon}</div>
                      
                      {/* Category Info */}
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* Game Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {stats.count || 0} games
                        </span>
                        <div className={`
                          w-8 h-8 rounded-lg bg-gradient-to-r ${category.color}
                          flex items-center justify-center opacity-80 group-hover:opacity-100
                          transition-opacity
                        `}>
                          <span className="text-white text-sm font-bold">→</span>
                        </div>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-gray-300 mb-8">
              Browse all games or use our search feature to find exactly what you want to play.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/games"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Browse All Games
              </Link>
              <Link
                href="/popular"
                className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                Popular Games
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 