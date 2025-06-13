// src/components/ads/AdRectangle.tsx - 矩形广告组件
// 功能说明: 用于页面侧边栏或内容区的矩形广告位，支持自定义尺寸

import React from "react";

interface AdRectangleProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 矩形广告组件
 * @param width 广告宽度，默认300px
 * @param height 广告高度，默认250px
 * @param className 自定义样式
 * @param children 可自定义广告内容
 */
export default function AdRectangle({ width = 300, height = 250, className = "", children }: AdRectangleProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg my-4 ${className}`}
      style={{ width: typeof width === "number" ? `${width}px` : width, height: typeof height === "number" ? `${height}px` : height }}
      aria-label="广告位"
    >
      {children || <span>Ad Rectangle Placeholder</span>}
    </div>
  );
} 