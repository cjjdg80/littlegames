// src/components/ui/GameCard.tsx - 游戏卡片组件  
// 功能说明: 可复用的游戏卡片，支持网格和列表视图，包含缩略图、标题、分类等信息，支持compact尺寸

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, Download, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface GameCardProps {
  game?: Game;
  id?: string;
  title?: string;
  category?: string;
  rating?: number;
  downloads?: string;
  image?: string;
  featured?: boolean;
  isNew?: boolean;
  slug?: string;
  description?: string;
  viewMode?: "grid" | "list";
  size?: "normal" | "compact";
  onPlay?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function GameCard({
  game,
  id,
  title,
  category,
  rating,
  downloads,
  image,
  featured,
  isNew,
  slug,
  description,
  viewMode = "grid",
  size = "normal",
  onPlay,
  onFavorite,
  onShare,
}: GameCardProps) {
  // 如果提供了 game 对象，使用其属性
  const gameId = game?.id || id;
  const gameTitle = game?.title || title;
  const gameCategory = game?.category || category;
  const gameRating = game?.rating || rating;
  const gameDownloads = game?.downloads || downloads;
  const gameImage = game?.image || image;
  const gameFeatured = game?.featured || featured;
  const gameIsNew = game?.isNew || isNew;
  const gameSlug = game?.slug || slug;
  const gameDescription = game?.description || description;

  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const gameUrl = gameSlug ? `/games/${gameCategory?.toLowerCase()}/${gameSlug}` : `/games/${gameId}`;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay?.(gameId!);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(gameId!);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(gameId!);
  };

  // 根据size和viewMode确定样式
  const isCompact = size === "compact";

  if (viewMode === "list") {
    return (
      <Link href={gameUrl} className="block" target="_blank" rel="noopener noreferrer">
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-700 hover:border-gray-600">
          <div className="flex gap-4 p-4">
            {/* 缩略图 */}
            <div className={cn(
              "relative flex-shrink-0 overflow-hidden rounded-lg",
              isCompact ? "w-16 h-12" : "w-24 h-18"
            )}>
              {!imageError ? (
                <Image
                  src={gameImage!}
                  alt={gameTitle!}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Play className={cn("text-gray-400", isCompact ? "w-4 h-4" : "w-6 h-6")} />
                </div>
              )}
              
              {/* 标签 */}
              <div className="absolute top-1 left-1 flex gap-1">
                {gameFeatured && (
                  <span className={cn(
                    "bg-yellow-500 text-yellow-900 font-medium rounded",
                    isCompact ? "text-xs px-1 py-0.5" : "text-xs px-1.5 py-0.5"
                  )}>
                    {isCompact ? "★" : "Featured"}
                  </span>
                )}
                {gameIsNew && (
                  <span className={cn(
                    "bg-green-500 text-white font-medium rounded",
                    isCompact ? "text-xs px-1 py-0.5" : "text-xs px-1.5 py-0.5"
                  )}>
                    {isCompact ? "N" : "New"}
                  </span>
                )}
              </div>
            </div>

            {/* 内容 */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className={cn(
                  "font-medium text-white line-clamp-1",
                  isCompact ? "text-sm" : "text-base"
                )}>{gameTitle}</h3>
                <div className="flex items-center gap-1 text-yellow-500 ml-2 flex-shrink-0">
                  <Star className={cn("fill-current", isCompact ? "w-3 h-3" : "w-4 h-4")} />
                  <span className={cn("font-medium", isCompact ? "text-xs" : "text-sm")}>{gameRating}</span>
                </div>
              </div>
              
              {!isCompact && gameDescription && (
                <p className="text-sm text-gray-300 mb-2 line-clamp-2">{gameDescription}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className={cn(
                  "flex items-center gap-4 text-gray-400",
                  isCompact ? "text-xs" : "text-sm"
                )}>
                  <span className="capitalize">{gameCategory}</span>
                  <span className="flex items-center gap-1">
                    <Download className={cn(isCompact ? "w-2 h-2" : "w-3 h-3")} />
                    {gameDownloads}
                  </span>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  {!isCompact && (
                    <>
                      <button
                        onClick={handleFavorite}
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          isFavorited ? "text-red-500 bg-red-900/30" : "text-gray-400 hover:text-red-500"
                        )}
                        title="Add to favorites"
                      >
                        <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                        title="Share game"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={handlePlay}
                    className={cn(
                      "bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1",
                      isCompact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
                    )}
                  >
                    <Play className={cn(isCompact ? "w-2 h-2" : "w-3 h-3")} />
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view (默认)
  return (
    <Link href={gameUrl} className="block" target="_blank" rel="noopener noreferrer">
      <div 
        className={cn(
          "bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-700 hover:border-gray-600",
          isCompact && "shadow-xs hover:shadow-sm"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          "relative overflow-hidden",
          isCompact ? "aspect-[4/3]" : "aspect-[4/3]"
        )}>
          {!imageError ? (
            <Image
              src={gameImage!}
              alt={gameTitle!}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <Play className={cn("text-gray-400", isCompact ? "w-6 h-6" : "w-8 h-8")} />
            </div>
          )}
          
          {/* 悬停播放按钮 */}
          {isHovered && !isCompact && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-3 rounded-full transition-all duration-200 transform hover:scale-110"
              >
                <Play className="w-6 h-6 fill-current" />
              </button>
            </div>
          )}
          
          {/* 标签 */}
          <div className={cn(
            "absolute flex gap-1",
            isCompact ? "top-1 left-1" : "top-2 left-2"
          )}>
            {gameFeatured && (
              <span className={cn(
                "bg-yellow-500 text-yellow-900 font-medium rounded",
                isCompact ? "text-xs px-1 py-0.5" : "text-xs px-2 py-1"
              )}>
                {isCompact ? "★" : "Featured"}
              </span>
            )}
            {gameIsNew && (
              <span className={cn(
                "bg-green-500 text-white font-medium rounded",
                isCompact ? "text-xs px-1 py-0.5" : "text-xs px-2 py-1"
              )}>
                {isCompact ? "N" : "New"}
              </span>
            )}
          </div>

          {/* 操作按钮 - 仅在非compact模式显示 */}
          {!isCompact && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleFavorite}
                className={cn(
                  "p-1.5 rounded-full backdrop-blur-sm transition-colors",
                  isFavorited 
                    ? "bg-red-500 text-white" 
                    : "bg-white bg-opacity-80 text-gray-700 hover:bg-red-500 hover:text-white"
                )}
                title="Add to favorites"
              >
                <Heart className={cn("w-3 h-3", isFavorited && "fill-current")} />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full bg-white bg-opacity-80 text-gray-700 hover:bg-blue-500 hover:text-white backdrop-blur-sm transition-colors"
                title="Share game"
              >
                <Share2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* 卡片内容 */}
        <div className={cn(
          "p-3",
          isCompact && "p-2"
        )}>
          <div className="flex items-start justify-between mb-2">
            <h3 className={cn(
              "font-medium text-white line-clamp-2",
              isCompact ? "text-sm leading-tight" : "text-base"
            )}>
              {gameTitle}
            </h3>
            <div className="flex items-center gap-1 text-yellow-500 ml-2 flex-shrink-0">
              <Star className={cn("fill-current", isCompact ? "w-3 h-3" : "w-4 h-4")} />
              <span className={cn("font-medium", isCompact ? "text-xs" : "text-sm")}>{gameRating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-3 text-gray-400",
              isCompact ? "text-xs" : "text-sm"
            )}>
              <span className="capitalize">{gameCategory}</span>
              <span className="flex items-center gap-1">
                <Download className={cn(isCompact ? "w-2 h-2" : "w-3 h-3")} />
                {gameDownloads}
              </span>
            </div>
            
            {/* Compact模式的播放按钮 */}
            {isCompact && (
              <button
                onClick={handlePlay}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Play className="w-2 h-2" />
                Play
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 