// src/components/layout/Sidebar.tsx - 左侧导航栏组件
import React from 'react';

/**
 * 左侧导航栏组件
 * 包含游戏分类图标，鼠标悬停时有放大效果
 */
export default function Sidebar() {
  const categories = [
    { id: 'home', icon: '🏠', label: '首页', active: true },
    { id: 'action', icon: '⚔️', label: '动作游戏' },
    { id: 'puzzle', icon: '🧩', label: '益智游戏' },
    { id: 'adventure', icon: '🗺️', label: '冒险游戏' },
    { id: 'racing', icon: '🏎️', label: '赛车游戏' },
    { id: 'sports', icon: '⚽', label: '体育游戏' },
    { id: 'strategy', icon: '♟️', label: '策略游戏' },
    { id: 'casual', icon: '🎮', label: '休闲游戏' },
    { id: 'arcade', icon: '🕹️', label: '街机游戏' },
    { id: 'shooting', icon: '🎯', label: '射击游戏' },
    { id: 'platform', icon: '🦘', label: '平台游戏' },
    { id: 'card', icon: '🃏', label: '卡牌游戏' },
    { id: 'board', icon: '🎲', label: '棋牌游戏' },
    { id: 'music', icon: '🎵', label: '音乐游戏' },
    { id: 'simulation', icon: '🏗️', label: '模拟游戏' },
    { id: 'rpg', icon: '🗡️', label: '角色扮演' },
    { id: 'fighting', icon: '👊', label: '格斗游戏' },
    { id: 'horror', icon: '👻', label: '恐怖游戏' },
    { id: 'educational', icon: '📚', label: '教育游戏' },
    { id: 'multiplayer', icon: '👥', label: '多人游戏' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-gray-900 z-50 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center py-4 space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`
              group relative flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer
              transition-all duration-200 ease-in-out
              hover:scale-110 hover:bg-gray-700
              ${
                category.active
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }
            `}
            title={category.label}
          >
            {/* 图标 */}
            <span className="text-xl transition-transform duration-200 group-hover:scale-110">
              {category.icon}
            </span>
            
            {/* 悬停时显示的标签 */}
            <div className="
              absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 whitespace-nowrap z-50
              before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2
              before:border-4 before:border-transparent before:border-r-gray-800
            ">
              {category.label}
            </div>
          </div>
        ))}
        
        {/* 底部设置按钮 */}
        <div className="mt-auto pt-4">
          <div className="
            group relative flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer
            bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700
            transition-all duration-200 ease-in-out hover:scale-110
          ">
            <span className="text-xl transition-transform duration-200 group-hover:scale-110">
              ⚙️
            </span>
            
            <div className="
              absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 whitespace-nowrap z-50
              before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2
              before:border-4 before:border-transparent before:border-r-gray-800
            ">
              设置
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}