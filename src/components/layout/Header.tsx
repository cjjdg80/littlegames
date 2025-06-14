// src/components/layout/Header.tsx - 响应式导航栏组件
// 功能说明: 网站顶部导航，包含Logo、搜索、用户状态等功能

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Users, Trophy, Gamepad2, Menu, X } from "lucide-react";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo区域 */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Play Browser Mini Games</h1>
              <p className="text-xs text-gray-400">Free online games, play instantly</p>
            </div>
          </Link>

          {/* 桌面端导航链接 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/games" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              Games
            </Link>
            <Link href="/categories" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              Categories
            </Link>
            <Link href="/new" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              New Games
            </Link>
            <Link href="/popular" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
              Popular
            </Link>
          </nav>

          {/* 右侧功能区 */}
          <div className="flex items-center gap-4">
            {/* 在线用户数 */}
            <div className="hidden sm:flex items-center gap-2 text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">12.5K online</span>
            </div>

            {/* 排行榜按钮 */}
            <Link 
              href="/leaderboard"
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-800 text-gray-300 transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-700">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/games" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Games
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Categories
              </Link>
              <Link 
                href="/new" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                target="_blank" 
                rel="noopener noreferrer"
              >
                New Games
              </Link>
              <Link 
                href="/popular" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Popular
              </Link>
              <Link 
                href="/leaderboard" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 