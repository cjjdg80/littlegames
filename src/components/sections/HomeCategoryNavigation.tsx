// src/components/sections/HomeCategoryNavigation.tsx - 首页分类导航组件
// 功能说明: 首页游戏分类导航，直接链接到分类页面，支持SEO友好的导航

"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Gamepad2 } from "lucide-react";

interface Category {
  slug: string;
  name: string;
  description: string;
  gameCount: number;
}

interface HomeCategoryNavigationProps {
  categories?: Category[];
}

// 默认分类数据（作为后备）- 包含完整的8个分类
const defaultCategories: Category[] = [
  {
    slug: "action",
    name: "Action",
    description: "Fast-paced and intense games",
    gameCount: 1500
  },
  {
    slug: "adventure", 
    name: "Adventure",
    description: "Epic quests and exploration games",
    gameCount: 1200
  },
  {
    slug: "puzzle",
    name: "Puzzle", 
    description: "Brain teasers and logic games",
    gameCount: 1800
  },
  {
    slug: "strategy",
    name: "Strategy",
    description: "Tactical and planning games", 
    gameCount: 900
  },
  {
    slug: "arcade",
    name: "Arcade",
    description: "Classic arcade-style games",
    gameCount: 2100
  },
  {
    slug: "sports",
    name: "Sports",
    description: "Athletic and competition games",
    gameCount: 600
  },
  {
    slug: "casual",
    name: "Casual",
    description: "Easy-to-play games for everyone",
    gameCount: 1800
  },
  {
    slug: "simulation",
    name: "Simulation",
    description: "Realistic simulations and life management",
    gameCount: 800
  }
];

export default function HomeCategoryNavigation({ categories = defaultCategories }: HomeCategoryNavigationProps) {
  return (
    <section className="bg-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 分类标题 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Browse by Category</h2>
          <p className="text-gray-400">
            Discover thousands of games across all your favorite genres
          </p>
        </div>

        {/* 分类网格 - 调整为4列布局以更好地展示8个分类 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/games/${category.slug}`}
              className="group block p-6 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 border border-gray-600"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className="flex items-center justify-between mb-2">
                <Gamepad2 className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-300 transition-colors">
                {category.name}
              </h3>
              
              <p className="text-gray-400 text-xs mb-2 group-hover:text-gray-300 transition-colors">
                {category.description}
              </p>
              
              <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                {category.gameCount.toLocaleString()}+ games
              </div>
            </Link>
          ))}
        </div>

        {/* 查看全部链接 */}
        <div className="text-center mt-8">
          <Link
            href="/games"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Browse All Games
          </Link>
        </div>
      </div>
    </section>
  );
} 