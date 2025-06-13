// src/components/pages/FeaturedGamesPageClient.tsx - 精选游戏页面客户端组件
// 功能说明: 处理精选游戏页面的交互逻辑，支持5列布局和分页

"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import AllGames from "@/components/sections/AllGames";
import { HomePageGame } from "@/lib/gameDataAdapter";

interface FeaturedGamesPageClientProps {
  games: HomePageGame[];
  totalGames: number;
}

export default function FeaturedGamesPageClient({ 
  games, 
  totalGames 
}: FeaturedGamesPageClientProps) {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 50; // 每页50个游戏

  // 计算分页数据
  const totalPages = Math.ceil(games.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentPageGames = games.slice(startIndex, endIndex);

  // 面包屑导航数据
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Games", url: "/games" },
    { name: "Featured Games", url: "/games/featured" },
  ];

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 导航栏 */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* 主要内容区域 */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 面包屑导航 */}
          <Breadcrumb items={breadcrumbItems} />

          {/* 页面标题 */}
          <div className="flex items-center gap-3 mb-8 mt-6">
            <Star className="w-8 h-8 text-yellow-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-white">Featured Games</h1>
              <p className="text-gray-400 mt-1">
                Discover our handpicked selection of the best browser games
              </p>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mb-6">
            <p className="text-gray-400">
              Showing {currentPageGames.length} of {totalGames} featured games
            </p>
          </div>

          {/* 游戏列表 */}
          <AllGames
            games={currentPageGames}
            viewMode="grid"
            currentPage={currentPage}
            totalPages={totalPages}
            gamesPerPage={gamesPerPage}
            onPlayGame={handlePlayGame}
            onFavoriteGame={handleFavoriteGame}
            onShareGame={handleShareGame}
            onPageChange={handlePageChange}
            hasMore={false}
            onLoadMore={() => {}}
          />
        </div>
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
} 