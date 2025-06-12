// src/components/ui/GameCard.tsx - 游戏卡片组件  
// 功能说明: 可复用的游戏卡片，支持网格和列表视图，包含缩略图、标题、分类等信息

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, Download, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCardProps {
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
  viewMode?: "grid" | "list";
  onPlay?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function GameCard({
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
  onPlay,
  onFavorite,
  onShare,
}: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const gameUrl = slug ? `/games/${category.toLowerCase()}/${slug}` : `/games/${id}`;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay?.(id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(id);
  };

  if (viewMode === "list") {
    return (
      <Link href={gameUrl} className="block">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex gap-4 p-4">
            {/* 缩略图 */}
            <div className="relative w-24 h-18 flex-shrink-0 overflow-hidden rounded-lg">
              {!imageError ? (
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              {/* 标签 */}
              <div className="absolute top-1 left-1 flex gap-1">
                {featured && (
                  <span className="bg-yellow-500 text-yellow-900 text-xs px-1.5 py-0.5 rounded font-medium">
                    Featured
                  </span>
                )}
                {isNew && (
                  <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    New
                  </span>
                )}
              </div>
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-base line-clamp-1">{title}</h3>
                <div className="flex items-center gap-1 text-yellow-500 ml-2 flex-shrink-0">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{rating}</span>
                </div>
              </div>
              
              {description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="capitalize">{category}</span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {downloads}
                  </span>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFavorite}
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      isFavorited ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500"
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
                  <button
                    onClick={handlePlay}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
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
    <Link href={gameUrl} className="block">
      <div 
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {!imageError ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
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

          {/* 悬停操作 */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFavorite}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isFavorited ? "bg-red-500 text-white" : "bg-white/90 text-gray-900 hover:bg-white"
                  )}
                  title="Add to favorites"
                >
                  <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                </button>
                <button
                  onClick={handlePlay}
                  className="bg-white/90 text-gray-900 hover:bg-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  Play Now
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors"
                  title="Share game"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
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
              <Download className="w-3 h-3" />
              <span>{downloads}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 