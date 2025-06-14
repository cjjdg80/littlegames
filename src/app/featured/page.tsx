// src/app/featured/page.tsx - 精选游戏页面
// 功能说明: 展示编辑精选的高质量游戏

import React from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getFeaturedGamesFromLatest } from "@/lib/gameDataLoader";
import { adaptGamesForHomePage } from "@/lib/gameDataAdapter";
import { Star, Award, Crown, TrendingUp, Users, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// SEO元数据
export const metadata: Metadata = {
  title: "Featured Games - Editor's Choice | Play Browser Mini Games",
  description: "Play our hand-picked collection of the best browser games. Curated selection of high-quality games chosen by our editors.",
  keywords: "featured games, best games, editor's choice, curated games, top quality games, recommended games",
  openGraph: {
    title: "Featured Games - Editor's Choice | Play Browser Mini Games",
    description: "Play our hand-picked collection of the best browser games. Curated selection of high-quality games chosen by our editors.",
    url: "https://playbrowserminigames.com/featured",
    type: "website",
  },
};

// 精选游戏卡片组件
function FeaturedGameCard({ game, featured = false }: { game: any; featured?: boolean }) {
  // 生成模拟的质量评分
  const qualityScore = (4.5 + Math.random() * 0.5).toFixed(1);
  const playCount = Math.floor(Math.random() * 100000) + 50000;

  return (
    <Link
      href={`/games/${game.category}/${game.slug}`}
      className="group block bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10"
    >
      {/* 游戏图片 */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={game.image || "/images/default-game-thumbnail.svg"}
          alt={game.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* 精选标签 */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-semibold rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            FEATURED
          </span>
        </div>
        
        {/* 编辑推荐标签 */}
        {featured && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              EDITOR'S CHOICE
            </span>
          </div>
        )}
      </div>

      {/* 游戏信息 */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-1 mb-2">
          {game.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {game.description || "A carefully selected high-quality game that offers exceptional gameplay experience."}
        </p>
        
        {/* 游戏统计 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>{qualityScore}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{(playCount / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-400" />
            <span>Featured</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function FeaturedGamesPage() {
  // 获取精选游戏数据
  const featuredGames = await getFeaturedGamesFromLatest(60);
  const adaptedGames = adaptGamesForHomePage(featuredGames);
  
  // 确保有足够的游戏显示
  const displayGames = adaptedGames.slice(0, 48);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-yellow-600 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Featured Games</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover our hand-picked collection of the finest browser games. Each game is carefully selected by our editors for exceptional quality and gameplay.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Editor's Choice</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">High Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Player Favorites</span>
              </div>
            </div>
          </div>
        </section>

        {/* Editor's Top Picks */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">👑 Editor's Top Picks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayGames.slice(0, 3).map((game, index) => (
                <div key={game.slug} className="relative">
                  <FeaturedGameCard game={game} featured={true} />
                  {/* 特殊装饰 */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Featured Games */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Curated Collection</h2>
                <p className="text-gray-400">
                  Showing {displayGames.length} carefully selected games
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Star className="w-4 h-4" />
                <span>Quality guaranteed</span>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayGames.slice(3).map((game) => (
                <FeaturedGameCard key={game.slug} game={game} />
              ))}
            </div>

            {/* Quality Promise Section */}
            <div className="text-center mt-12">
              <div className="inline-flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-900" />
                </div>
                <h3 className="text-xl font-bold">Quality Promise</h3>
                <p className="text-gray-300 max-w-md">
                  Every featured game is tested and approved by our editorial team. We guarantee high-quality gameplay, smooth performance, and engaging content.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/popular"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Popular Games
                  </Link>
                  <Link
                    href="/new"
                    className="px-6 py-2 border border-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    New Releases
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Discover Excellence</h2>
            <p className="text-gray-300 mb-8">
              Our featured games represent the pinnacle of browser gaming. Each title offers unique gameplay, stunning visuals, and hours of entertainment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
              >
                Browse by Category
              </Link>
              <Link
                href="/games"
                className="px-8 py-3 border border-gray-600 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                All Games
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 