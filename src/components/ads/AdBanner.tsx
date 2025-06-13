// src/components/ads/AdBanner.tsx - 横幅广告组件
// 功能说明: 用于页面顶部或底部的横幅广告位，支持自定义高度和内容

import React from "react";

interface AdBannerProps {
  height?: number | string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 横幅广告组件
 * @param height 广告高度，默认60px
 * @param className 自定义样式
 * @param children 可自定义广告内容
 */
export default function AdBanner({ height = 60, className = "", children }: AdBannerProps) {
  return (
    <div
      className={`w-full flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg my-4 ${className}`}
      style={{ minHeight: typeof height === "number" ? `${height}px` : height }}
      aria-label="广告位"
    >
      {children || <span>Ad Banner Placeholder</span>}
    </div>
  );
} 