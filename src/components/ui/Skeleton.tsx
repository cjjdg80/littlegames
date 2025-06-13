// src/components/ui/Skeleton.tsx - 骨架屏组件
// 功能说明: 用于加载中占位，提升用户体验

import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}
      aria-busy="true"
      aria-label="加载中"
    />
  );
} 