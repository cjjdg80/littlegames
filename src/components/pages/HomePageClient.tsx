// src/components/pages/HomePageClient.tsx - 首页客户端组件
// 功能说明: 处理首页的交互逻辑和状态管理，使用SEO数据增强内容展示

"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import HomeCategoryNavigation from "@/components/sections/HomeCategoryNavigation";
import FeaturedGames from "@/components/sections/FeaturedGames";
import AllGames from "@/components/sections/AllGames";
import Footer from "@/components/layout/Footer";
import { HomeSEOData } from "@/lib/homeSEO";

// 演示数据接口
interface MockGame {
  id: string;
  title: string;
  category: string;
  rating: number;
  downloads: string;
  image: string;
  featured?: boolean;
  isNew?: boolean;
  slug: string;
  description: string;
}

// Props接口
interface HomePageClientProps {
  seoData: HomeSEOData;
}

// 演示数据 - 保持与原有UI相同
const mockGames: MockGame[] = [
  {
    id: "1",
    title: "Puzzle Master",
    category: "Puzzle",
    rating: 4.8,
    downloads: "2.1M",
    image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop",
    featured: true,
    slug: "puzzle-master",
    description: "Challenge your mind with this addictive puzzle game featuring hundreds of levels.",
  },
  {
    id: "2", 
    title: "Space Adventure",
    category: "Adventure",
    rating: 4.9,
    downloads: "3.2M",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    featured: true,
    slug: "space-adventure",
    description: "Explore the galaxy in this epic space adventure with stunning graphics.",
  },
  {
    id: "3",
    title: "Action Hero", 
    category: "Action",
    rating: 4.4,
    downloads: "2.8M",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    featured: true,
    slug: "action-hero",
    description: "Fast-paced action game with intense combat and amazing special effects.",
  },
  {
    id: "4",
    title: "Memory Challenge",
    category: "Puzzle", 
    rating: 4.7,
    downloads: "1.2M",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    featured: true,
    slug: "memory-challenge",
    description: "Test and improve your memory skills with this engaging brain training game.",
  },
  {
    id: "5",
    title: "Racing Pro",
    category: "Racing",
    rating: 4.6, 
    downloads: "1.8M",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
    isNew: true,
    slug: "racing-pro",
    description: "High-speed racing game with realistic physics and stunning tracks.",
  },
  {
    id: "6",
    title: "Strategy Wars",
    category: "Strategy",
    rating: 4.5,
    downloads: "990K", 
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
    slug: "strategy-wars",
    description: "Build your empire and conquer enemies in this deep strategy game.",
  },
  {
    id: "7",
    title: "Adventure Quest",
    category: "Adventure",
    rating: 4.3,
    downloads: "1.5M", 
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
    slug: "adventure-quest",
    description: "Embark on an epic quest filled with mysteries and treasures.",
  },
  {
    id: "8",
    title: "Puzzle World",
    category: "Puzzle",
    rating: 4.6,
    downloads: "800K", 
    image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop",
    isNew: true,
    slug: "puzzle-world",
    description: "Explore a world of mind-bending puzzles and brain teasers.",
  },
];

export default function HomePageClient({ seoData }: HomePageClientProps) {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState("");

  // 从SEO数据获取分类信息
  const categories = seoData.featuredCategories?.map(cat => ({
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    gameCount: cat.gameCount
  })) || [];

  // 获取精选游戏
  const featuredGames = mockGames.filter(game => game.featured);

  // 从SEO数据获取统计信息，回退到默认值
  const gameCount = seoData.stats?.totalGames || 9900;
  const userCount = "12.5K"; // 固定值，可以后续从真实数据源获取

  // 事件处理函数
  const handlePlayGame = (gameId: string) => {
    console.log(`Playing game ${gameId}`);
    // TODO: 导航到游戏详情页
  };

  const handleFavoriteGame = (gameId: string) => {
    console.log(`Added game ${gameId} to favorites`);
    // TODO: 实现收藏功能
  };

  const handleShareGame = (gameId: string) => {
    console.log(`Sharing game ${gameId}`);
    // TODO: 实现分享功能
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 导航栏 */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Hero区域 - 使用SEO数据中的统计信息 */}
      <HeroSection 
        gameCount={gameCount}
        userCount={userCount}
      />

      {/* 分类导航 - 使用SEO数据中的分类信息 */}
      <HomeCategoryNavigation categories={categories} />

      {/* 主要内容区域 */}
      <main className="flex-1">
        {/* 精选游戏区域 */}
        <FeaturedGames
          games={featuredGames}
          onPlayGame={handlePlayGame}
          onFavoriteGame={handleFavoriteGame}
          onShareGame={handleShareGame}
        />

        {/* 全部游戏区域 */}
        <AllGames
          games={mockGames}
          viewMode="grid"
          currentPage={1}
          totalPages={1}
          gamesPerPage={8}
          onPlayGame={handlePlayGame}
          onFavoriteGame={handleFavoriteGame}
          onShareGame={handleShareGame}
          hasMore={false}
          loading={false}
        />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
} 