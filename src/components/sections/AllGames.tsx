// src/components/sections/AllGames.tsx - 全部游戏展示区组件
// 功能说明: 展示所有游戏列表，支持5列网格布局、分页，每页50个游戏（10排×5个）

"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface AllGamesProps {
  games: Game[];
  viewMode?: "grid" | "list";
  currentPage?: number;
  totalPages?: number;
  gamesPerPage?: number;
  onPlayGame?: (gameId: string) => void;
  onFavoriteGame?: (gameId: string) => void;
  onShareGame?: (gameId: string) => void;
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export default function AllGames({
  games,
  viewMode = "grid",
  currentPage = 1,
  totalPages = 1,
  gamesPerPage = 50, // 每页50个游戏
  onPlayGame,
  onFavoriteGame,
  onShareGame,
  onPageChange,
  onLoadMore,
  hasMore = false,
  loading = false,
}: AllGamesProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    
    setIsLoadingMore(true);
    await onLoadMore?.();
    setIsLoadingMore(false);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    onPageChange?.(page);
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题和统计 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">All Games</h2>
          <span className="text-sm text-gray-400">
            {games.length} game{games.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* 游戏网格 - 5列布局 */}
        {games.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {games.map((game) => (
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
                  viewMode={viewMode}
                  size="compact"
                  onPlay={onPlayGame}
                  onFavorite={onFavoriteGame}
                  onShare={onShareGame}
                />
              ))}
            </div>

            {/* 分页导航 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* 页码 */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 页面信息 */}
            {totalPages > 1 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages} • {gamesPerPage} games per page
                </span>
              </div>
            )}
          </>
        ) : (
          /* 空状态 */
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Games Found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse all categories.
              </p>
            </div>
          </div>
        )}

        {/* 加载指示器 */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading games...</p>
          </div>
        )}
      </div>
    </section>
  );
} 