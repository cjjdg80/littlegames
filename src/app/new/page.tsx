// src/app/new/page.tsx - 最新游戏页面
// 功能说明: 展示最新添加的游戏，按时间倒序排列，支持分页浏览

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getAllNewestGames } from "@/lib/gameDataLoader";
import { adaptGamesForHomePage } from "@/lib/gameDataAdapter";
import { Clock, Star, Users, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// SEO元数据
export const metadata: Metadata = {
  title: "New Games - Latest Browser Games | Play Browser Mini Games",
  description: "Discover the newest browser games added daily. Play the latest free online games instantly without downloads.",
  keywords: "new games, latest games, newest browser games, recent games, fresh games, new online games",
  openGraph: {
    title: "New Games - Latest Browser Games | Play Browser Mini Games",
    description: "Discover the newest browser games added daily. Play the latest free online games instantly without downloads.",
    url: "https://playbrowserminigames.com/new",
    type: "website",
  },
};

// 游戏卡片组件
function GameCard({ game }: { game: any }) {
  return (
    <Link
      href={`/games/${game.category}/${game.slug}`}
      className="group block bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* 游戏图片 */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={game.image_url || "/images/default-game-thumbnail.svg"}
          alt={game.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* 新游戏标签 */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
            NEW
          </span>
        </div>
        
        {/* 分类标签 */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-blue-500/80 text-white text-xs font-medium rounded-full capitalize">
            {game.category}
          </span>
        </div>
      </div>

      {/* 游戏信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
          {game.name}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {game.description || "Play this exciting new game instantly in your browser!"}
        </p>
        
        {/* 游戏统计 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>4.5</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>1.2K</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>New</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function NewGamesPage() {
  // 获取最新游戏数据
  const newestGames = await getAllNewestGames();
  const adaptedGames = adaptGamesForHomePage(newestGames);
  
  // 限制显示数量（前100个最新游戏）
  const displayGames = adaptedGames.slice(0, 100);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">New Games</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the latest games added to our collection. Fresh content updated daily for endless entertainment.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Updated Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Latest & Greatest</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Fresh Content</span>
              </div>
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Latest Additions</h2>
                <p className="text-gray-400">
                  Showing {displayGames.length} newest games
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Updated today</span>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayGames.map((game, index) => (
                <GameCard key={`${game.slug}-${index}`} game={game} />
              ))}
            </div>

            {/* Load More Section */}
            {newestGames.length > 100 && (
              <div className="text-center mt-12">
                <div className="inline-flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="text-gray-300">
                    Want to see more? Browse all games or check out specific categories.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/games"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                      Browse All Games
                    </Link>
                    <Link
                      href="/categories"
                      className="px-6 py-2 border border-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                    >
                      View Categories
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-8">
              New games are added regularly. Bookmark this page to never miss the latest additions to our gaming collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/popular"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Popular Games
              </Link>
              <Link
                href="/categories"
                className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 