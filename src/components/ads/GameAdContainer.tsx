// src/components/ads/GameAdContainer.tsx - 游戏详情页广告位预留组件
// 功能说明: 预留广告容器，支持后续通过管理系统动态加载广告

import React from "react";

export interface GameAdContainerProps {
  gameId: string;
  category: string;
  position?: 'below-game' | 'sidebar' | 'footer';
  size?: '728x90' | '320x50' | '300x250' | 'responsive';
  enabled?: boolean;
  lazyLoad?: boolean;
  className?: string;
}

/**
 * 游戏详情页广告位预留组件
 * 默认不显示内容，仅预留容器，便于后续动态注入广告
 */
export default function GameAdContainer({
  gameId,
  category,
  position = 'below-game',
  size = 'responsive',
  enabled = false,
  lazyLoad = true,
  className = ''
}: GameAdContainerProps) {
  // 仅当 enabled 为 true 时才渲染广告内容
  if (!enabled) {
    return (
      <div
        className={`w-full flex items-center justify-center bg-transparent ${className}`}
        aria-label="Ad Placeholder"
        data-ad-position={position}
        data-ad-size={size}
        data-ad-game={gameId}
        data-ad-category={category}
        style={{ minHeight: 0, height: 0, margin: 0, padding: 0 }}
      />
    );
  }
  // 预留广告内容区域，后续可通过管理系统动态注入
  return (
    <div
      className={`w-full flex items-center justify-center my-4 bg-gray-200 text-gray-400 rounded-lg ${className}`}
      aria-label="广告位"
      data-ad-position={position}
      data-ad-size={size}
      data-ad-game={gameId}
      data-ad-category={category}
      style={{ minHeight: size === '728x90' ? 90 : size === '320x50' ? 50 : size === '300x250' ? 250 : 60 }}
    >
      {/* 广告内容占位，后续可替换为真实广告代码 */}
      <span>Ad Placeholder ({size})</span>
    </div>
  );
} 