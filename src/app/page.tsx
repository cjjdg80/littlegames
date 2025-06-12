// src/app/page.tsx - 游戏网站首页
// 功能说明: 简洁现代的游戏聚合首页，匹配SmallGames参考设计
"use client";

import React, { useState } from "react";
import { Search, Play, Star, Users, Trophy, Gamepad2, Grid3X3, List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// 简化的游戏卡片组件
interface GameCardProps {
  id: string;
  title: string;
  category: string;
  rating: number;
  downloads: string;
  image: string;
  featured?: boolean;
  isNew?: boolean;
  onPlay: (id: string) => void;
}

const GameCard = ({ id, title, category, rating, downloads, image, featured, isNew, onPlay }: GameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        
        {/* 标签 */}
        <div className="absolute top-2 left-2 flex gap-1">
          {featured && (
            <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded font-medium">
              Featured
            </span>
          )}
          {isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
              New
            </span>
          )}
        </div>

        {/* Play Now 按钮 - 悬停显示 */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <button
              onClick={() => onPlay(id)}
              className="bg-white/90 text-gray-900 hover:bg-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4" />
              Play Now
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-medium text-gray-900 truncate text-sm">{title}</h3>
          <div className="flex items-center gap-1 text-yellow-500 ml-2 flex-shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="capitalize">{category}</span>
          <span className="flex items-center gap-1">
            <span>↓</span>
            <span>{downloads}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// 主组件
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");

  // 演示数据 - 更多游戏以匹配参考图片
  const featuredGames = [
    {
      id: "1",
      title: "Puzzle Master",
      category: "Puzzle",
      rating: 4.8,
      downloads: "2.1M",
      image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop",
      featured: true,
    },
    {
      id: "2", 
      title: "Space Adventure",
      category: "Adventure",
      rating: 4.9,
      downloads: "3.2M",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      featured: true,
    },
    {
      id: "3",
      title: "Action Hero", 
      category: "Action",
      rating: 4.4,
      downloads: "2.8M",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      featured: true,
    },
  ];

  const allGames = [
    ...featuredGames,
    {
      id: "4",
      title: "Memory Challenge",
      category: "Puzzle", 
      rating: 4.7,
      downloads: "1.2M",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
      featured: true,
    },
    {
      id: "5",
      title: "Racing Pro",
      category: "Racing",
      rating: 4.6, 
      downloads: "1.8M",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
      isNew: true,
    },
    {
      id: "6",
      title: "Strategy Wars",
      category: "Strategy",
      rating: 4.5,
      downloads: "990K", 
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
    },
    {
      id: "7",
      title: "Adventure Quest",
      category: "Adventure",
      rating: 4.3,
      downloads: "1.5M", 
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
    },
    {
      id: "8",
      title: "Puzzle World",
      category: "Puzzle",
      rating: 4.6,
      downloads: "800K", 
      image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop",
      isNew: true,
    },
  ];

  const categories = ["All", "puzzle", "racing", "adventure", "strategy", "action"];

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || game.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handlePlayGame = (gameId: string) => {
    console.log(`Playing game ${gameId}`);
    // TODO: 导航到游戏详情页
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 顶部导航 */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo区域 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SmallGames</h1>
                <p className="text-xs text-gray-400">Play instantly, anywhere</p>
              </div>
            </div>
            
            {/* 右侧工具栏 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="text-sm">12.5K online</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-800 text-gray-300">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
            </div>
          </div>

          {/* 搜索栏和控制 */}
          <div className="mt-4 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="search"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-800 text-gray-300">
                  Sort: {sortBy}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex border border-gray-600 rounded-lg">
                <button
                  className={cn(
                    "px-3 py-2 rounded-l-lg",
                    viewMode === "grid" 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-400 hover:bg-gray-800"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  className={cn(
                    "px-3 py-2 rounded-r-lg",
                    viewMode === "list" 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-400 hover:bg-gray-800"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 分类筛选 */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "whitespace-nowrap text-sm px-4 py-2 rounded-lg transition-colors",
                  selectedCategory === category 
                    ? "bg-white text-gray-900" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Games 区域 */}
        {selectedCategory === "All" && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <h2 className="text-xl font-semibold text-white">Featured Games</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredGames.map((game) => (
                <GameCard key={game.id} {...game} onPlay={handlePlayGame} />
              ))}
            </div>
          </section>
        )}

        {/* All Games 区域 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">All Games</h2>
            <span className="text-sm text-gray-400">
              {filteredGames.length} games found
            </span>
          </div>
          
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {filteredGames.map((game) => (
              <GameCard key={game.id} {...game} onPlay={handlePlayGame} />
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No games found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
