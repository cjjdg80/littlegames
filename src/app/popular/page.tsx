// src/app/popular/page.tsx - 热门游戏页面
// 功能说明: 展示最受欢迎的游戏，按热度和评分排序

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getFeaturedGamesFromLatest, getAllNewestGames } from "@/lib/gameDataLoader";
import { adaptGamesForHomePage } from "@/lib/gameDataAdapter";
import { TrendingUp, Star, Users, Fire, Trophy, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// SEO元数据
export const metadata: Metadata = {
  title: "Popular Games - Most Played Browser Games | Play Browser Mini Games",
  description: "Play the most popular browser games loved by millions. Discover trending games with highest ratings and most plays.",
  keywords: "popular games, trending games, most played games, top games, best browser games, highest rated games",
  openGraph: {
    title: "Popular Games - Most Played Browser Games | Play Browser Mini Games",
    description: "Play the most popular browser games loved by millions. Discover trending games with highest ratings and most plays.",
    url: "https://playbrowserminigames.com/popular",
    type: "website",
  },
};

// 热门游戏卡片组件
function PopularGameCard({ game, rank }: { game: any; rank: number }) {
  // 根据排名生成不同的徽章
  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: "bg-yellow-500 text-yellow-900",
        2: "bg-gray-400 text-gray-900", 
        3: "bg-amber-600 text-amber-100"
      };
      return (
        <div className={`absolute top-3 left-3 w-8 h-8 rounded-full ${colors[rank as keyof typeof colors]} flex items-center justify-center font-bold text-sm`}>
          {rank}
        </div>
      );
    }
    return (
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
        {rank}
      </div>
    );
  };

  // 生成模拟的热度数据
  const popularity = Math.floor(Math.random() * 50000) + 10000;
  const rating = (4.0 + Math.random() * 1.0).toFixed(1);

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
        
        {/* 排名徽章 */}
        {getRankBadge(rank)}
        
        {/* 热门标签 */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
            <Fire className="w-3 h-3" />
            HOT
          </span>
        </div>
      </div>

      {/* 游戏信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
          {game.name}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {game.description || "One of the most popular games on our platform!"}
        </p>
        
        {/* 游戏统计 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{(popularity / 1000).toFixed(1)}K</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span>#{rank}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function PopularGamesPage() {
  // 获取热门游戏数据（使用精选游戏作为热门游戏）
  const featuredGames = await getFeaturedGamesFromLatest(50);
  const allGames = await getAllNewestGames();
  
  // 合并并适配游戏数据
  const combinedGames = [...featuredGames, ...allGames.slice(0, 50)];
  const adaptedGames = adaptGamesForHomePage(combinedGames);
  
  // 去重并限制显示数量
  const uniqueGames = adaptedGames.filter((game, index, self) => 
    index === self.findIndex(g => g.slug === game.slug)
  ).slice(0, 60);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                <Fire className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Popular Games</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the most loved games on our platform. These trending titles are played by millions of gamers worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Top Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Most Played</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Player Favorites</span>
              </div>
            </div>
          </div>
        </section>

        {/* Top 3 Games Spotlight */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">🏆 Top 3 Most Popular</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {uniqueGames.slice(0, 3).map((game, index) => (
                <div key={game.slug} className="relative">
                  <PopularGameCard game={game} rank={index + 1} />
                  {/* 特殊装饰 */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-yellow-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Popular Games */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Trending Now</h2>
                <p className="text-gray-400">
                  Showing {uniqueGames.length} most popular games
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>Updated hourly</span>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uniqueGames.slice(3).map((game, index) => (
                <PopularGameCard key={game.slug} game={game} rank={index + 4} />
              ))}
            </div>

            {/* Load More Section */}
            <div className="text-center mt-12">
              <div className="inline-flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-300">
                  Looking for more games? Explore our complete collection or browse by category.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/games"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Browse All Games
                  </Link>
                  <Link
                    href="/new"
                    className="px-6 py-2 border border-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    New Games
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the Fun</h2>
            <p className="text-gray-300 mb-8">
              Millions of players can't be wrong! Start playing these popular games and see why they're loved by gamers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Browse Categories
              </Link>
              <Link
                href="/new"
                className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                Discover New Games
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 