// src/components/pages/GameDetailClient.tsx - 游戏详情页客户端组件
// 功能说明: 游戏详情页的主要展示组件，包含游戏iframe、描述和相关推荐

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Star, Download, Heart, Share2, Maximize2 } from "lucide-react";
import GameCard from "@/components/ui/GameCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import GameAdContainer from "@/components/ads/GameAdContainer";

interface Game {
  id: string;
  title: string;
  primary_category: string;
  rating?: number;
  downloads?: string;
  thumbnail: string;
  description: string;
  instructions?: string;
  iframe_src: string;
  iframe_width: number;
  iframe_height: number;
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
  slug?: string;
}

interface GameDetailClientProps {
  game: Game;
  relatedGames: Game[];
}

export default function GameDetailClient({ game, relatedGames }: GameDetailClientProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [views, setViews] = useState<number | null>(null);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game.title,
        text: `Play ${game.title} online for free!`,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // 访问量统计：本地存储+API预留
  useEffect(() => {
    // 本地存储简单统计
    const key = `game-views-${game.id}`;
    let count = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, String(count));
    setViews(count);
    // TODO: 可扩展为调用后端API统计
  }, [game.id]);

  return (
    <div className="space-y-8">
      {/* 主内容区：横向分栏 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左侧：游戏iframe区域 */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 min-h-[240px]">
            <div className="relative w-full" style={{ aspectRatio: `${game.iframe_width}/${game.iframe_height}` }}>
              {!iframeLoaded && !iframeError && (
                <Skeleton className="absolute inset-0 w-full h-full bg-gray-700" />
              )}
              {iframeError ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  Game loading failed, please try again later.
                </div>
              ) : (
                <iframe
                  src={game.iframe_src}
                  width={game.iframe_width}
                  height={game.iframe_height}
                  className={cn(
                    "w-full h-full",
                    isFullscreen ? "fixed inset-0 z-50" : "relative",
                    !iframeLoaded && "invisible"
                  )}
                  allowFullScreen
                  title={`Play ${game.title}`}
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                />
              )}
              <button
                onClick={handleFullscreen}
                className="absolute bottom-4 right-4 bg-gray-900/80 text-white p-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {/* 右侧：相关推荐区域 */}
        <div className="w-full lg:w-[260px] flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-4 mb-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-white mb-4">Related Games</h2>
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 flex-1">
              {relatedGames.length > 0 ? (
                relatedGames.map((relatedGame) => (
                  <GameCard
                    key={relatedGame.id}
                    game={relatedGame}
                    viewMode="list"
                  />
                ))
              ) : (
                <div className="text-gray-400 text-center">No related games</div>
              )}
            </div>
            {/* --- Ad Slot #2: Sidebar/Related Games Area ---
                This is a reserved ad container for the sidebar (related games area).
                - Responsive width: always matches the sidebar width.
                - Default: not displayed (enabled=false), only a placeholder for future dynamic ad injection.
                - Can be managed by the admin system for enabling/disabling and ad code injection.
                - Does not affect layout or SEO when disabled.
            */}
            <GameAdContainer
              gameId={game.id}
              category={game.primary_category}
              position="sidebar"
              size="responsive"
              enabled={false}
              lazyLoad={true}
              className="mt-4"
            />
          </div>
        </div>
      </div>
      {/* --- Ad Slot #1: Below Game Iframe ---
          This is a reserved ad container directly below the game iframe.
          - Responsive width: matches the main content area.
          - Default: not displayed (enabled=false), only a placeholder for future dynamic ad injection.
          - Can be managed by the admin system for enabling/disabling and ad code injection.
          - Does not affect layout or SEO when disabled.
      */}
      <GameAdContainer
        gameId={game.id}
        category={game.primary_category}
        position="below-game"
        size="responsive"
        enabled={false}
        lazyLoad={true}
      />
      {/* 信息面板，全宽 */}
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
        {/* 游戏缩略图（放大） */}
        <div className="relative w-48 h-36 rounded-lg overflow-hidden flex-shrink-0 mb-4 md:mb-0">
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
        {/* 信息内容 */}
        <div className="flex-1 w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{game.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              {game.primary_category}
            </span>
            {game.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-gray-300 mb-4">
            {game.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span>{game.rating}</span>
              </div>
            )}
            {game.downloads && (
              <div className="flex items-center gap-1">
                <Download className="w-5 h-5" />
                <span>{game.downloads}</span>
              </div>
            )}
            {views !== null && (
              <div className="flex items-center gap-1">
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Visits: {views}</span>
              </div>
            )}
          </div>
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleFavorite}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                isFavorited
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
              {isFavorited ? "Favorited" : "Add to Favorites"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
          {/* 操作说明 */}
          {game.instructions && (
            <div className="text-gray-400 text-sm bg-gray-900 rounded p-3">
              <span className="font-semibold">Instructions:</span> {game.instructions}
            </div>
          )}
        </div>
      </div>
      {/* 游戏描述 */}
      {game.description && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">About This Game</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {game.description}
          </p>
        </div>
      )}
      {/* 更多推荐游戏 */}
      {relatedGames.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            More Recommended Games
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedGames.map((relatedGame) => (
              <GameCard
                key={relatedGame.id}
                game={relatedGame}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 