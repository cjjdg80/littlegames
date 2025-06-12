// src/components/sections/FeaturedGames.tsx - 热门游戏展示区组件
// 功能说明: 展示精选推荐游戏，支持3列网格布局和轮播功能

"use client";

import React from "react";
import { Star } from "lucide-react";
import GameCard from "@/components/ui/GameCard";

interface Game {
  id: string;
  title: string;
  category: string;
  rating: number;
  downloads: string;
  image: string;
  featured?: boolean;
  isNew?: boolean;
  slug?: string;
  description?: string;
}

interface FeaturedGamesProps {
  games: Game[];
  onPlayGame?: (gameId: string) => void;
  onFavoriteGame?: (gameId: string) => void;
  onShareGame?: (gameId: string) => void;
}

export default function FeaturedGames({ 
  games, 
  onPlayGame, 
  onFavoriteGame, 
  onShareGame 
}: FeaturedGamesProps) {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题区域 */}
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <h2 className="text-xl font-semibold text-white">Featured Games</h2>
        </div>

        {/* 游戏网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.slice(0, 3).map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              category={game.category}
              rating={game.rating}
              downloads={game.downloads}
              image={game.image}
              featured={game.featured}
              isNew={game.isNew}
              slug={game.slug}
              description={game.description}
              viewMode="grid"
              onPlay={onPlayGame}
              onFavorite={onFavoriteGame}
              onShare={onShareGame}
            />
          ))}
        </div>

        {/* 查看更多链接 */}
        <div className="text-center mt-6">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            View All Featured Games →
          </button>
        </div>
      </div>
    </section>
  );
} 