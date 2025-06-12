// src/components/sections/CategoryNavigation.tsx - 游戏分类导航组件
// 功能说明: 游戏分类筛选导航，支持响应式布局和滚动

"use client";

import React from "react";
import { ChevronDown, Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryNavigationProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function CategoryNavigation({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: CategoryNavigationProps) {
  const sortOptions = [
    { value: "popular", label: "Popular" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Highest Rated" },
    { value: "alphabetical", label: "A-Z" },
  ];

  return (
    <section className="bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* 分类标签 */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "whitespace-nowrap text-sm px-4 py-2 rounded-lg transition-colors",
                  selectedCategory === category
                    ? "bg-white text-gray-900"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                )}
              >
                {category === "All" ? "All Games" : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 筛选和视图控制 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* 左侧：分类信息 */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              {selectedCategory === "All" ? "All Games" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Games`}
            </h2>
            <p className="text-sm text-gray-400">
              {selectedCategory === "All" 
                ? "Discover thousands of free online games"
                : `Best ${selectedCategory} games to play instantly`
              }
            </p>
          </div>

          {/* 右侧：排序和视图控制 */}
          <div className="flex items-center gap-2">
            {/* 排序选择器 */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* 视图模式切换 */}
            <div className="flex border border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "px-3 py-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800"
                )}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "px-3 py-2 transition-colors",
                  viewMode === "list"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800"
                )}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 快速筛选标签 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Quick filters:</span>
          <button className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
            Multiplayer
          </button>
          <button className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
            Single Player
          </button>
          <button className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
            Mobile Friendly
          </button>
          <button className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
            No Flash
          </button>
        </div>
      </div>
    </section>
  );
} 