// src/components/sections/FeaturedGames.tsx - 热门游戏展示区组件
// 功能说明: 展示精选推荐游戏，支持5列网格布局，显示10个游戏（2排×5个）

"use client";

import React from "react";
import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Games</h2>
          <Link
            href="/games/featured"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            target="_blank" 
            rel="noopener noreferrer"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 游戏网格 - 5列布局，显示10个游戏（2排×5个） */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {games.slice(0, 10).map((game) => (
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
              size="compact"
              onPlay={onPlayGame}
              onFavorite={onFavoriteGame}
              onShare={onShareGame}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 