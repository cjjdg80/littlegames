// src/components/pages/HomePageClient.tsx - 首页客户端组件
// 功能说明: 处理首页的交互逻辑和状态管理，使用真实游戏数据

"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import HomeCategoryNavigation from "@/components/sections/HomeCategoryNavigation";
import FeaturedGames from "@/components/sections/FeaturedGames";
import AllGames from "@/components/sections/AllGames";
import Footer from "@/components/layout/Footer";
import { HomeSEOData } from "@/lib/homeSEO";
import { HomePageGame } from "@/lib/gameDataAdapter";

// Props接口
interface HomePageClientProps {
  seoData: HomeSEOData;
  featuredGames: HomePageGame[];
  newestGames: HomePageGame[];
}

export default function HomePageClient({ 
  seoData, 
  featuredGames, 
  newestGames 
}: HomePageClientProps) {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState("");

  // 从SEO数据获取分类信息
  const categories = seoData.featuredCategories?.map(cat => ({
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    gameCount: cat.gameCount
  })) || [];

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
        {/* 精选游戏区域 - 使用真实数据 */}
        <FeaturedGames
          games={featuredGames}
          onPlayGame={handlePlayGame}
          onFavoriteGame={handleFavoriteGame}
          onShareGame={handleShareGame}
        />

        {/* 全部游戏区域 - 使用最新游戏数据 */}
        <AllGames
          games={newestGames}
          viewMode="grid"
          currentPage={1}
          totalPages={1}
          gamesPerPage={12}
          onPlayGame={handlePlayGame}
          onFavoriteGame={handleFavoriteGame}
          onShareGame={handleShareGame}
          hasMore={false}
          onLoadMore={() => {}}
          onPageChange={() => {}}
        />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
} 